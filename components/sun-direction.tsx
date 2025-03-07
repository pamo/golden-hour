'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Compass } from 'lucide-react';

export function SunDirection({ goldenHourData, deviceOrientation }) {
  const canvasRef = useRef(null);
  const [compassAvailable, setCompassAvailable] = useState(false);

  useEffect(() => {
    // Check if device orientation is available
    setCompassAvailable(deviceOrientation !== null);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw compass
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#fef3c7'; // amber-100
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#d97706'; // amber-600
    ctx.stroke();

    // Draw cardinal directions
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#78350f'; // amber-900
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Adjust text positions based on device orientation if available
    const rotation = deviceOrientation !== null ? deviceOrientation : 0;

    // Draw N, S, E, W with rotation
    const directions = [
      { label: 'N', angle: 0 - rotation * (Math.PI / 180) },
      { label: 'E', angle: Math.PI / 2 - rotation * (Math.PI / 180) },
      { label: 'S', angle: Math.PI - rotation * (Math.PI / 180) },
      { label: 'W', angle: (3 * Math.PI) / 2 - rotation * (Math.PI / 180) },
    ];

    directions.forEach((dir) => {
      const x = centerX + (radius - 15) * Math.sin(dir.angle);
      const y = centerY - (radius - 15) * Math.cos(dir.angle);
      ctx.fillText(dir.label, x, y);
    });

    // Draw sun position for morning and evening golden hour
    const now = new Date();
    let sunPosition;

    // Determine which golden hour to show (morning, evening, or next)
    if (now >= goldenHourData.morningStart && now <= goldenHourData.morningEnd) {
      sunPosition = goldenHourData.morningSunAzimuth;
    } else if (now >= goldenHourData.eveningStart && now <= goldenHourData.eveningEnd) {
      sunPosition = goldenHourData.eveningSunAzimuth;
    } else if (now < goldenHourData.morningStart) {
      sunPosition = goldenHourData.morningSunAzimuth;
    } else {
      sunPosition = goldenHourData.eveningSunAzimuth;
    }

    // Convert azimuth to radians and adjust for canvas coordinate system
    const sunAngle = (sunPosition - 90) * (Math.PI / 180);
    // Adjust for device orientation if available
    const adjustedSunAngle =
      deviceOrientation !== null ? sunAngle - rotation * (Math.PI / 180) : sunAngle;

    // Draw sun
    const sunX = centerX + (radius - 40) * Math.cos(adjustedSunAngle);
    const sunY = centerY + (radius - 40) * Math.sin(adjustedSunAngle);

    // Sun glow
    const gradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 20);
    gradient.addColorStop(0, '#fbbf24'); // amber-400
    gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 20, 0, 2 * Math.PI);
    ctx.fill();

    // Sun
    ctx.beginPath();
    ctx.arc(sunX, sunY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#f59e0b'; // amber-500
    ctx.fill();

    // Draw line from center to sun
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(sunX, sunY);
    ctx.strokeStyle = '#d97706'; // amber-600
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw center dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#78350f'; // amber-900
    ctx.fill();
  }, [goldenHourData, deviceOrientation]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Compass className="h-4 w-4" />
          Sun Direction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <canvas ref={canvasRef} width={200} height={200} className="mb-2" />

          {!compassAvailable && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              For accurate direction, allow compass access or rotate your device.
            </p>
          )}

          <div className="mt-2 text-center text-sm">
            <p>Point your device in the direction you want to shoot</p>
            <p className="mt-1 font-medium">
              Sun azimuth: {Math.round(goldenHourData.currentSunAzimuth)}°
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
