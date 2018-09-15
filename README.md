# Services

These are some services, cron jobs, automated scripts, etc., I run.

Thanks to [Heroku](https://heroku.com/) for hosting these services for free. :smile:

## `/services/wayback`

[Wayback Machine](https://archive.org/web/) is a digital archive of the web. This script is scheduled as a cron job and takes a digital backup of my personal website by parsing its sitemap daily.

## `/services/dateimage`

This script returns a PNG image containing the current date and time. This is useful to test HTTP proxies for caching. I'm using it to see how long GitHub caches images in the README for and how frequently it updates those images. Here's a demo:

![Date time image](https://anand-services.herokuapp.com/dateimage)
