module.exports = function (name, email) {
  return {
    users: [{
      userRoles: [
        {roleName: 'Full_Admin', roleState: 'INACTIVE'},
        {roleName: 'Readonly_Admin', roleState: 'ACTIVE'},
        {roleName: 'Sales_Admin', roleState: 'INACTIVE'},
        {roleName: 'Billing', roleState: 'INACTIVE'},
        {roleName: 'Support', roleState: 'INACTIVE'},
        {roleName: 'Reports', roleState: 'INACTIVE'},
        {roleName: 'User_Admin', roleState: 'INACTIVE'},
        {roleName: 'Device_Admin', roleState: 'INACTIVE'},
        {roleName: 'HCS_Readonly_Admin', roleState: 'INACTIVE'},
        {roleName: 'HCS_Full_Admin', roleState: 'INACTIVE'},
        {roleName: 'Help_Desk', roleState: 'INACTIVE'},
        {roleName: 'Help_Desk_Advanced', roleState: 'INACTIVE'},
        {roleName: 'Partner_Management', roleState: 'INACTIVE'},
        {roleName: 'Spark_SyncKms', roleState: 'INACTIVE'}
      ],
      email,
      name
    }]
  }
}