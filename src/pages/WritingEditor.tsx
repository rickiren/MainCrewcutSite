import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Clock, DollarSign, AlertTriangle, TrendingUp, Navigation, Fuel, Package, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";

const LogisticsDashboard = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock real-time data
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sample fleet data
  const fleetData = [
    { id: 1, driver: "Mike Chen", status: "optimal", location: "Downtown LA", eta: "14:30", fuel: 78, packages: 24, lat: 34.0522, lng: -118.2437 },
    { id: 2, driver: "Sarah Wilson", status: "delayed", location: "Santa Monica", eta: "15:45", fuel: 45, packages: 18, lat: 34.0195, lng: -118.4912 },
    { id: 3, driver: "James Rodriguez", status: "optimal", location: "Beverly Hills", eta: "13:15", fuel: 92, packages: 31, lat: 34.0736, lng: -118.4004 },
    { id: 4, driver: "Lisa Park", status: "caution", location: "Hollywood", eta: "16:20", fuel: 23, packages: 12, lat: 34.0928, lng: -118.3287 },
    { id: 5, driver: "David Kumar", status: "optimal", location: "Pasadena", eta: "14:00", fuel: 67, packages: 28, lat: 34.1478, lng: -118.1445 }
  ];

  const alerts = [
    { type: "warning", message: "Vehicle #2 experiencing 15min delay due to traffic", time: "2 min ago" },
    { type: "info", message: "AI suggests route optimization for Vehicle #4 - Save $47", time: "5 min ago" },
    { type: "success", message: "Vehicle #1 completed delivery ahead of schedule", time: "8 min ago" },
    { type: "warning", message: "Vehicle #4 fuel level below 25% - Refuel recommended", time: "12 min ago" }
  ];

  const metrics = {
    totalSavings: 2.4,
    fuelEfficiency: 94.2,
    onTimeDelivery: 87.5,
    routeOptimization: 91.8
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'optimal': return 'text-green-600 bg-green-100';
      case 'caution': return 'text-yellow-600 bg-yellow-100';
      case 'delayed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertColor = (type) => {
    switch(type) {
      case 'success': return 'border-green-400 bg-green-50 text-green-700';
      case 'warning': return 'border-yellow-400 bg-yellow-50 text-yellow-700';
      case 'info': return 'border-blue-400 bg-blue-50 text-blue-700';
      default: return 'border-gray-400 bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <Link to="/apps" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Apps
            </Link>
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">AI Logistics Optimizer</h1>
                  <p className="text-gray-600 mt-1">
                    Real-time fleet management & optimization dashboard with interactive tracking and AI-powered insights.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Main Dashboard Block */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Dashboard Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Live Dashboard</h2>
                    <div className="text-sm text-gray-500">
                      Live Data: {currentTime.toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6">
                  <div className="flex">
                    {/* Sidebar */}
                    <aside className="w-48 bg-gray-50 rounded-lg p-4 mr-6">
                      <nav className="space-y-2">
                        <button
                          onClick={() => setActiveTab('overview')}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            activeTab === 'overview' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm">Overview</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('fleet')}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            activeTab === 'fleet' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Truck className="h-4 w-4" />
                          <span className="text-sm">Fleet</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('routes')}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            activeTab === 'routes' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Navigation className="h-4 w-4" />
                          <span className="text-sm">Routes</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('analytics')}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            activeTab === 'analytics' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm">Analytics</span>
                        </button>
                      </nav>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                      {activeTab === 'overview' && (
                        <div className="space-y-6">
                          {/* KPI Cards */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium text-gray-600">Monthly Savings</p>
                                  <p className="text-lg font-bold text-green-600">${metrics.totalSavings}M</p>
                                  <p className="text-xs text-green-600">+12% from last month</p>
                                </div>
                                <div className="bg-green-100 p-2 rounded-lg">
                                  <DollarSign className="h-4 w-4 text-green-600" />
                                </div>
                              </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium text-gray-600">Fuel Efficiency</p>
                                  <p className="text-lg font-bold text-blue-600">{metrics.fuelEfficiency}%</p>
                                  <p className="text-xs text-blue-600">+5.2% improvement</p>
                                </div>
                                <div className="bg-blue-100 p-2 rounded-lg">
                                  <Fuel className="h-4 w-4 text-blue-600" />
                                </div>
                              </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium text-gray-600">On-Time Delivery</p>
                                  <p className="text-lg font-bold text-orange-600">{metrics.onTimeDelivery}%</p>
                                  <p className="text-xs text-orange-600">-2.1% needs attention</p>
                                </div>
                                <div className="bg-orange-100 p-2 rounded-lg">
                                  <Clock className="h-4 w-4 text-orange-600" />
                                </div>
                              </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium text-gray-600">Route Optimization</p>
                                  <p className="text-lg font-bold text-purple-600">{metrics.routeOptimization}%</p>
                                  <p className="text-xs text-purple-600">AI-powered efficiency</p>
                                </div>
                                <div className="bg-purple-100 p-2 rounded-lg">
                                  <Navigation className="h-4 w-4 text-purple-600" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Map and Alerts */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-2 bg-gray-50 rounded-lg border border-gray-200 p-4">
                              <h3 className="text-sm font-semibold text-gray-900 mb-3">Live Fleet Map</h3>
                              <div className="relative bg-gray-100 rounded-lg h-48 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
                                  <div className="absolute inset-4 bg-white/20 rounded border-2 border-dashed border-white/40"></div>
                                  <div className="absolute top-4 left-4 text-xs font-medium text-gray-700">Los Angeles Metro Area</div>
                                  
                                  {/* Vehicle markers */}
                                  {fleetData.map((vehicle, idx) => (
                                    <div
                                      key={vehicle.id}
                                      className={`absolute w-2 h-2 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                                        vehicle.status === 'optimal' ? 'bg-green-500' :
                                        vehicle.status === 'caution' ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{
                                        left: `${20 + idx * 15}%`,
                                        top: `${30 + (idx % 3) * 20}%`
                                      }}
                                      onClick={() => setSelectedVehicle(vehicle)}
                                    >
                                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-1 py-0.5 rounded whitespace-nowrap">
                                        #{vehicle.id}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {selectedVehicle && (
                                <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                                  <h4 className="font-medium text-gray-900 text-sm">Vehicle #{selectedVehicle.id} - {selectedVehicle.driver}</h4>
                                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                    <div>Status: <span className={`px-1 py-0.5 rounded text-xs ${getStatusColor(selectedVehicle.status)}`}>{selectedVehicle.status}</span></div>
                                    <div>ETA: {selectedVehicle.eta}</div>
                                    <div>Fuel: {selectedVehicle.fuel}%</div>
                                    <div>Packages: {selectedVehicle.packages}</div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                              <h3 className="text-sm font-semibold text-gray-900 mb-3">Live Alerts</h3>
                              <div className="space-y-2">
                                {alerts.slice(0, 3).map((alert, idx) => (
                                  <div key={idx} className={`p-2 rounded-lg border-l-2 text-xs ${getAlertColor(alert.type)}`}>
                                    <p className="font-medium">{alert.message}</p>
                                    <p className="mt-1 opacity-75">{alert.time}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'fleet' && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900">Fleet Management</h3>
                          
                          <div className="bg-gray-50 rounded-lg border border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-900">Active Vehicles</h4>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ETA</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fuel</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {fleetData.map((vehicle) => (
                                    <tr key={vehicle.id} className="hover:bg-gray-100">
                                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{vehicle.id}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {vehicle.driver}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                                          {vehicle.status}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {vehicle.location}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {vehicle.eta}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center">
                                          <div className="w-12 bg-gray-200 rounded-full h-1.5 mr-2">
                                            <div 
                                              className={`h-1.5 rounded-full ${
                                                vehicle.fuel > 50 ? 'bg-green-500' : 
                                                vehicle.fuel > 25 ? 'bg-yellow-500' : 'bg-red-500'
                                              }`}
                                              style={{ width: `${vehicle.fuel}%` }}
                                            ></div>
                                          </div>
                                          {vehicle.fuel}%
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'routes' && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900">AI Route Optimization</h3>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">Optimization Suggestions</h4>
                              <div className="space-y-3">
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                  <div className="flex items-start space-x-3">
                                    <div className="bg-green-100 p-1.5 rounded-lg">
                                      <TrendingUp className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-green-900 text-sm">Route Optimization Available</h5>
                                      <p className="text-xs text-green-700 mt-1">Vehicle #4 can save 23 minutes and $47 in fuel costs.</p>
                                      <button className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">
                                        Apply Optimization
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">Performance Impact</h4>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                                  <span className="text-xs font-medium text-gray-700">Fuel Savings (Today)</span>
                                  <span className="text-sm font-bold text-green-600">$1,247</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                                  <span className="text-xs font-medium text-gray-700">Time Saved (Today)</span>
                                  <span className="text-sm font-bold text-blue-600">3.2 hrs</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'analytics' && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900">Analytics & Insights</h3>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">Cost Savings Trend</h4>
                              <div className="h-32 bg-white rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                  <p className="text-xs text-gray-600">Monthly savings increasing by 12%</p>
                                  <p className="text-lg font-bold text-green-600 mt-1">$2.4M Total</p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">Efficiency Metrics</h4>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-xs font-medium text-gray-700">Route Optimization</span>
                                    <span className="text-xs text-gray-600">91.8%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div className="bg-blue-600 h-1.5 rounded-full" style={{width: '91.8%'}}></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-xs font-medium text-gray-700">Fuel Efficiency</span>
                                    <span className="text-xs text-gray-600">94.2%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div className="bg-green-600 h-1.5 rounded-full" style={{width: '94.2%'}}></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold mb-4">About</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-sm mb-2">Starting prompt</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Can you make an interactive logistics dashboard that displays real-time fleet management data with AI-powered insights? Include interactive elements like clickable vehicle markers, real-time metrics, and multiple tabs for different views. Use your excellent front end skills to make it look very professional and well polished.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold mb-4">Features</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Real-time fleet tracking with interactive map</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>AI-powered route optimization suggestions</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Live alerts and performance metrics</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Responsive design for all devices</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LogisticsDashboard;
