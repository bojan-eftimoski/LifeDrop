import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function Emergency() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Emergency Response</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Emergencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-700">Emergency Alert</h3>
                <p className="text-red-600">Location: 46.38, 13.849</p>
                <p className="text-red-600">Type: Medical Emergency</p>
                <div className="mt-4">
                  <Button variant="destructive">Respond Now</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Total Emergencies Today</span>
                <span className="text-2xl font-bold">3</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Average Response Time</span>
                <span className="text-2xl font-bold">4.5 min</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Active Drones</span>
                <span className="text-2xl font-bold">2</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Response Protocol</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-700">
                Step 1: Alert Verification
              </h3>
              <p className="text-blue-600">
                Verify emergency details and location accuracy
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-700">
                Step 2: Drone Deployment
              </h3>
              <p className="text-blue-600">
                Select and deploy nearest available drone
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-700">
                Step 3: Monitor Progress
              </h3>
              <p className="text-blue-600">
                Track drone movement and delivery status
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
