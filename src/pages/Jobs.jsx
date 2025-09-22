import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Clock, Briefcase, Star, Users, Award } from 'lucide-react';

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [jobs] = useState([
    {
      id: 1,
      title: 'Senior Software Engineer',
      company: 'MINDWARE Technologies',
      location: 'Mumbai, Maharashtra',
      type: 'Full-time',
      experience: '3-5 years',
      salary: '₹8,00,000 - ₹12,00,000',
      posted: '2 days ago',
      department: 'Engineering',
      description: 'We are looking for a Senior Software Engineer to join our dynamic team. You will be responsible for developing and maintaining our barcode printing solutions.',
      requirements: [
        "Bachelor's degree in Computer Science or related field",
        '3+ years of experience in software development',
        'Proficiency in React, Node.js, and MySQL',
        'Experience with barcode printing technologies',
        'Strong problem-solving skills'
      ],
      benefits: [
        'Competitive salary package',
        'Health insurance',
        'Flexible working hours',
        'Professional development opportunities',
        'Team building activities'
      ]
    },
    {
      id: 2,
      title: 'Sales Manager',
      company: 'MINDWARE Technologies',
      location: 'Delhi, NCR',
      type: 'Full-time',
      experience: '2-4 years',
      salary: '₹6,00,000 - ₹10,00,000',
      posted: '1 week ago',
      department: 'Sales',
      description: 'Join our sales team and help us expand our market presence. You will be responsible for managing client relationships and driving sales growth.',
      requirements: [
        "Bachelor's degree in Business or related field",
        '2+ years of sales experience',
        'Excellent communication skills',
        'Knowledge of barcode printing industry',
        'Target-driven mindset'
      ],
      benefits: [
        'Performance-based incentives',
        'Travel allowances',
        'Health insurance',
        'Sales training programs',
        'Career growth opportunities'
      ]
    }
  ]);

  const [filteredJobs, setFilteredJobs] = useState(jobs);

  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(job => job.department.toLowerCase() === selectedFilter.toLowerCase());
    }

    setFilteredJobs(filtered);
  }, [searchTerm, selectedFilter, jobs]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-6">Join Our Team</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Build the future of barcode technology with MINDWARE Technologies
            </p>
            
            {/* Stats */}
            <div className="flex justify-center gap-8 mt-12">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm">Employees</div>
              </div>
              <div className="text-center">
                <Briefcase className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{jobs.length}</div>
                <div className="text-sm">Open Positions</div>
              </div>
              <div className="text-center">
                <Star className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">4.8/5</div>
                <div className="text-sm">Rating</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white py-8 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs, companies, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Departments</option>
                <option value="engineering">Engineering</option>
                <option value="sales">Sales</option>
                <option value="support">Support</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-6">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No jobs found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-lg text-blue-600 font-semibold mb-2">{job.company}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{job.experience}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 lg:mt-0 lg:text-right">
                    <div className="text-2xl font-bold text-green-600 mb-1">{job.salary}</div>
                    <div className="text-sm text-gray-500">Posted {job.posted}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 mb-4">{job.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {job.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Benefits:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {job.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold">
                    Apply Now
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-semibold">
                    Save Job
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;