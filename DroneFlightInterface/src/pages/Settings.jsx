import React, { useState } from "react";
import { Switch } from "../components/ui/switch";
import { Slider } from "../components/ui/slider";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Settings() {
  const [gpsInterval, setGpsInterval] = useState([30]); // Default 30 seconds
  const [crashDetection, setCrashDetection] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [panicTriggered, setPanicTriggered] = useState(false);

  const handlePanic = () => {
    setPanicTriggered(true);
    // Simulate alert
    alert("PANIC ALERT TRIGGERED! Emergency services have been notified.");
    // Reset after 3 seconds
    setTimeout(() => setPanicTriggered(false), 3000);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-6">
        {/* GPS Ping Interval */}
        <Card>
          <CardHeader>
            <CardTitle>GPS Ping Interval</CardTitle>
            <CardDescription>
              Set how often drones report their location (in seconds)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Slider
                value={gpsInterval}
                onValueChange={setGpsInterval}
                min={10}
                max={60}
                step={5}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Current interval: {gpsInterval[0]} seconds
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Crash Detection */}
        <Card>
          <CardHeader>
            <CardTitle>Crash Detection</CardTitle>
            <CardDescription>
              Enable automatic crash detection and alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                checked={crashDetection}
                onCheckedChange={setCrashDetection}
              />
              <span className="text-sm">
                {crashDetection ? "Enabled" : "Disabled"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Panic Button */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Controls</CardTitle>
            <CardDescription>
              Trigger emergency response for all drones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              size="lg"
              className="w-full"
              onClick={handlePanic}
              disabled={panicTriggered}
            >
              <AlertCircle className="mr-2 h-5 w-5" />
              {panicTriggered ? "Alert Sent!" : "TRIGGER PANIC ALERT"}
            </Button>
          </CardContent>
        </Card>

        {/* Theme Switch */}
        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>
              Switch between light and dark mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
              <span className="text-sm">
                {isDarkMode ? "Dark Mode" : "Light Mode"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
