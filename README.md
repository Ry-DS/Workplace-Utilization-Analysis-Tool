# Workplace-Utilization-Analysis-Tool (WUAT)
![Logo](http://ryan-s.me/img/logos/wuat.png)


### [Video Demo](https://www.youtube.com/watch?v=A3zRdM5V-Gg&t=15s)

## Why was this built? 

As part of my final year, we had to find a real problem to solve using the power of software. 

I manged to partner with BGIS, an integrated solution to property management to help them solve a problem regarding their data collection process. 

Human resource management often wanted a broad understanding of how often employees use the meeting rooms and other spaces they've provided and the best system they've had so far is to manually track this data by walking around the space periodically and noting down the rooms that were in use, which was incredibly inefficient and time-consuming. 
 
They needed a solution that made this process more automated and streamline while also remaining easy to implement. 

This is where WUAT stepped in. 

WUAT is a full stack MERN application conjoined with a C# client, designed to track monitor change events and effectively sort this data based on teams and times to provide management a deep insight on how often employees use their meeting rooms, desks or just the laptop itself. 

This kind of data proved priceless as it effectively allowed management to cater to their workforce's needs while also remaining efficient. 

## How was it built? 

This application was built primarily off the MERN stack (MongoDB, Express, React and NodeJS) with an additional C# application that runs on every employee's computer. The C# application is responsible for the data collection, securely sending monitor change events to the Node server to be logged in MongoDB. 

## What tools were used? 

This application was built using JetBrains Webstorm. 
Git management was streamlined with GitKraken. 
A domain was provided from Namecheap and testing was conducted with Digital Ocean. 

All resources were free thanks to the GitHub Developer Pack! 
