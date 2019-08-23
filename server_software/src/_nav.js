//defines the nav items in the sidebar.
export default {//defines everything in the sidebar
  items: [
    {
      title: true,//says this item is a title to a subset
      name: 'View',//name to show
      wrapper: {            // optional wrapper object
        element: '',        // required valid HTML5 element tag
        attributes: {}        // optional valid JS object with JS API naming ex: { className: "my-class", style: { fontFamily: "Verdana" }, id: "my-id"}
      },
      class: ''             // optional class names space delimited list for title item ex: "text-center"
    },
    {
      name: 'Dashboard',//for an actual item, more data is needed
      url: '/dashboard',//link to go to
      icon: 'icon-speedometer',//icon to show
    },
    {
      name: 'Data Breakdown',
      url: '/charts',
      icon: 'icon-graph',
    },
    {
      title: true,
      name: 'Manage',
      wrapper: {
        element: '',
        attributes: {}
      },
      class: ''
    },
    {
      name: 'Users',
      url: '/users',
      icon: 'icon-user',
    },
    {
      name: 'Employee Teams',
      url: '/teams',
      icon: 'icon-people',
    },
    {
      name: 'Monitor Groups',
      url: '/monitor-groups',
      icon: 'cui-laptop',
    },
    {
      title: true,
      name: 'Other',
      wrapper: {
        element: '',
        attributes: {}
      },
      class: ''
    },

    {
      divider: true,
    },
    {
      name: 'Visit BGIS',
      url: 'https://www.bgis.com/',
      icon: 'icon-layers',
      variant: 'danger',
      attributes: { target: '_blank', rel: "noopener" },
    },

    //end of samples children

  ]
}
;
