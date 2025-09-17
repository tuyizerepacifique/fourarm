const express = require('express');
const { authenticate } = require('../middleware/auth');
const { User, Contribution, Settings, sequelize } = require('../models');
const { Op, fn, col } = require('sequelize');

const router = express.Router();

// Helper function to get next meeting from settings
async function getNextMeeting() {
  try {
    const meetingTitle = await Settings.findOne({ where: { key: 'nextMeetingTitle' } });
    const meetingDate = await Settings.findOne({ where: { key: 'nextMeetingDate' } });
    const meetingTime = await Settings.findOne({ where: { key: 'nextMeetingTime' } });
    
    if (meetingDate && meetingDate.value) {
      const date = new Date(meetingDate.value);
      if (meetingTime && meetingTime.value) {
        const [hours, minutes] = meetingTime.value.split(':');
        date.setHours(parseInt(hours), parseInt(minutes));
      }
      
      if (!isNaN(date.getTime())) {
        return {
          date: date,
          title: meetingTitle ? meetingTitle.value : 'Family Meeting',
          time: meetingTime ? meetingTime.value : '15:00'
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching next meeting:', error);
    return null;
  }
}

// Helper function to get contribution chart data
async function getContributionChartData() {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyContributions = await Contribution.findAll({
      attributes: [
        [fn('DATE_TRUNC', 'month', col('createdAt')), 'month'],
        [fn('SUM', col('amount')), 'total']
      ],
      where: {
        status: 'completed',
        createdAt: { [Op.gte]: sixMonthsAgo }
      },
      group: [fn('DATE_TRUNC', 'month', col('createdAt'))],
      order: [[fn('DATE_TRUNC', 'month', col('createdAt')), 'ASC']],
      raw: true
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const contributionData = monthlyContributions.map(item => ({
      month: monthNames[new Date(item.month).getMonth()],
      amount: parseInt(item.total) || 0
    }));

    const completeContributionData = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(currentDate.getMonth() - i);
      const monthName = monthNames[monthDate.getMonth()];
      
      const existingData = contributionData.find(item => item.month === monthName);
      completeContributionData.push(existingData || { month: monthName, amount: 0 });
    }

    return completeContributionData;
  } catch (error) {
    console.error('Contribution chart data error:', error);
    return [];
  }
}

router.get('/', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    // Get user's contributions
    const myContributions = await Contribution.sum('amount', {
      where: { userId: user.id, status: 'completed' }
    }) || 0;

    // Get total family fund (sum of all completed contributions)
    const familyFund = await Contribution.sum('amount', {
      where: { status: 'completed' }
    }) || 0;

    // Get member stats
    const totalMembers = await User.count({
      where: { status: 'active' }
    });
    
    // Get unique users who have completed contributions
    const paidUsers = await Contribution.findAll({
      attributes: ['userId'],
      where: { status: 'completed' },
      group: ['userId'],
      raw: true
    });
    const paidCount = paidUsers.length;

    // Get recent contributions for activity feed
    const recentContributions = await Contribution.findAll({
      where: { status: 'completed' },
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [{
        model: User,
        attributes: ['firstName', 'lastName'],
        as: 'user'
      }]
    });

    const recentActivity = recentContributions.map(contribution => ({
      id: contribution.id,
      message: `${contribution.user.firstName} ${contribution.user.lastName} contributed RWF ${contribution.amount.toLocaleString()}`,
      timestamp: contribution.createdAt,
      type: 'contribution'
    }));

    // Calculate growth percentages
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    // User's contribution growth
    const lastMonthUserContributions = await Contribution.sum('amount', {
      where: { 
        userId: user.id,
        status: 'completed',
        createdAt: { [Op.gte]: lastMonth }
      }
    }) || 0;

    const myContributionsGrowth = lastMonthUserContributions > 0 ? 
      Math.round(((myContributions - lastMonthUserContributions) / lastMonthUserContributions) * 100) : 0;

    // Family fund growth
    const lastMonthFamilyContributions = await Contribution.sum('amount', {
      where: { 
        status: 'completed',
        createdAt: { [Op.gte]: lastMonth }
      }
    }) || 0;

    const familyFundGrowth = lastMonthFamilyContributions > 0 ? 
      Math.round(((familyFund - lastMonthFamilyContributions) / lastMonthFamilyContributions) * 100) : 0;

    // Get next meeting from settings
    const nextMeetingData = await getNextMeeting();
    const nextMeeting = nextMeetingData ? nextMeetingData.date : null;

    // Get chart data
    const contributionData = await getContributionChartData();

    // Return dashboard data
    const dashboardData = {
      success: true,
      // Data for ALL users
      myContributions,
      myContributionsGrowth,
      familyFund,
      familyFundGrowth,
      totalMembers,
      paidCount,
      nextMeeting,
      recentActivity,
      
      // Admin-specific data
      pendingApprovals: user.role === 'admin' ? await Contribution.count({ 
        where: { status: 'pending' } 
      }) : 0,
      
      totalContributions: user.role === 'admin' ? await Contribution.count() : 0,
      
      recentRegistrations: user.role === 'admin' ? await User.findAll({
        order: [['createdAt', 'DESC']],
        limit: 3,
        attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt', 'role']
      }) : [],

      // Chart data - only contribution data since investment data comes from investments route
      contributionData: user.role === 'admin' ? contributionData : [],

      // System health data for admin
      systemHealth: user.role === 'admin' ? {
        database: 'connected',
        api: 'active',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      } : null
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to load dashboard data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;