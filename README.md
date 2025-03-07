# Golden Hour Checker

A lightweight web application that helps photographers determine the quality of the golden hour in their current location or a location of their choice. The app provides real-time weather data, golden hour timing, and sun direction guidance to help photographers capture the perfect shot.

![Golden Hour Checker App](https://placeholder.svg?height=400&width=800)

## Features

- **Location-based Weather Analysis**

  - Use your current location or search for any location worldwide
  - Check weather conditions that affect golden hour quality (clouds, rain, fog)
  - Get a quality assessment based on current conditions

- **Golden Hour Timing**

  - View precise morning and evening golden hour times
  - See countdown to the next golden hour
  - Get notified when golden hour is currently happening

- **Sun Direction Guidance**

  - Visual compass showing sun position during golden hour
  - Device orientation support on mobile to show sun direction relative to where you're pointing
  - Sun azimuth information for precise positioning

- **Responsive Design**
  - Works seamlessly on both mobile and desktop devices
  - Dark mode support
  - Intuitive, photographer-friendly interface

## Technologies Used

- **Next.js** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **SunCalc** - Library for calculating sun position
- **OpenWeatherMap API** - Weather data provider
- **shadcn/ui** - UI component library
- **Device Orientation API** - For compass functionality on mobile devices

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/golden-hour-checker.git
   cd golden-hour-checker
   ```
