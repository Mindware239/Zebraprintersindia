import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, Briefcase, DollarSign, Filter, Eye, ArrowRight } from 'lucide-react';
import apiService from '../services/api';
import JobApplicationForm from '../components/JobApplicationForm';

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await apiService.getJobs(1, 50);
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyNow = (job) => {
    setSelectedJob(job);
    setShowApplicationForm(true);
  };

  const handleCloseApplicationForm = () => {
    setShowApplicationForm(false);
    setSelectedJob(null);
  };

  const handleSubmitApplication = async (applicationData) => {
    try {
      await apiService.submitJobApplication(applicationData);
      alert('Application submitted successfully! We will review your application and get back to you soon.');
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  const [filteredJobs, setFilteredJobs] = useState([]);

  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedJobType !== 'all') {
      filtered = filtered.filter(job => job.job_type === selectedJobType);
    }

    if (selectedExperience !== 'all') {
      filtered = filtered.filter(job => job.experience_level === selectedExperience);
    }

    setFilteredJobs(filtered);
  }, [searchTerm, selectedJobType, selectedExperience, jobs]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getJobTypeColor = (jobType) => {
    const colors = {
      'full-time': 'bg-green-100 text-green-800',
      'part-time': 'bg-blue-100 text-blue-800',
      'contract': 'bg-purple-100 text-purple-800',
      'internship': 'bg-orange-100 text-orange-800'
    };
    return colors[jobType] || 'bg-gray-100 text-gray-800';
  };

  const getExperienceColor = (level) => {
    const colors = {
      'entry': 'bg-green-100 text-green-800',
      'mid': 'bg-yellow-100 text-yellow-800',
      'senior': 'bg-red-100 text-red-800',
      'executive': 'bg-purple-100 text-purple-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchJobs}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Career Opportunities</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our team and be part of the future of barcode technology. Explore exciting career opportunities with us.
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search jobs, company, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Job Type Filter */}
              <div>
                <select
                  value={selectedJobType}
                  onChange={(e) => setSelectedJobType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              {/* Experience Level Filter */}
              <div>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Jobs Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Featured Badge */}
              {job.featured && (
                <div className="mb-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </span>
                </div>
              )}

              {/* Job Header */}
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h2>
                <div className="flex items-center text-gray-600 mb-2">
                  <Briefcase size={16} className="mr-2" />
                  <span className="font-medium">{job.company}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin size={16} className="mr-2" />
                  <span>{job.location}</span>
                </div>
              </div>

              {/* Job Type and Experience */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getJobTypeColor(job.job_type)}`}>
                  {job.job_type.replace('-', ' ').toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getExperienceColor(job.experience_level)}`}>
                  {job.experience_level.toUpperCase()}
                </span>
              </div>

              {/* Salary */}
              {job.salary_range && (
                <div className="flex items-center text-green-600 font-medium mb-4">
                  <DollarSign size={16} className="mr-1" />
                  <span>{job.salary_range}</span>
                </div>
              )}

              {/* Description */}
              <p className="text-gray-600 mb-4 line-clamp-3">
                {job.description}
              </p>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  <span>Posted {formatDate(job.created_at)}</span>
                </div>
                <div className="flex items-center">
                  <Eye size={16} className="mr-1" />
                  <span>{job.views} views</span>
                </div>
              </div>

              {/* Apply Button */}
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => handleApplyNow(job)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Now
                  <ArrowRight size={16} className="ml-2" />
                </button>
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredJobs.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <Briefcase size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters.
            </p>
          </motion.div>
        )}
      </div>

      {/* Job Application Form Modal */}
      <JobApplicationForm
        job={selectedJob}
        isOpen={showApplicationForm}
        onClose={handleCloseApplicationForm}
        onSubmit={handleSubmitApplication}
      />
    </div>
  );
};

export default Jobs;