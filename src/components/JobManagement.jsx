import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter, Briefcase, MapPin, DollarSign } from 'lucide-react';
import apiService from '../services/api';
import './JobManagement.css';

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    company: '',
    location: '',
    job_type: 'full-time',
    experience_level: 'entry',
    salary_range: '',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    application_email: '',
    application_url: '',
    status: 'active',
    featured: false
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await apiService.getJobs(1, 100);
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await apiService.updateJob(editingJob.id, formData);
      } else {
        await apiService.createJob(formData);
      }
      setShowForm(false);
      setEditingJob(null);
      setFormData({
        title: '',
        slug: '',
        company: '',
        location: '',
        job_type: 'full-time',
        experience_level: 'entry',
        salary_range: '',
        description: '',
        requirements: '',
        responsibilities: '',
        benefits: '',
        application_email: '',
        application_url: '',
        status: 'active',
        featured: false
      });
      fetchJobs();
    } catch (err) {
      console.error('Error saving job:', err);
      setError('Failed to save job');
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      slug: job.slug,
      company: job.company,
      location: job.location,
      job_type: job.job_type,
      experience_level: job.experience_level,
      salary_range: job.salary_range || '',
      description: job.description,
      requirements: job.requirements || '',
      responsibilities: job.responsibilities || '',
      benefits: job.benefits || '',
      application_email: job.application_email || '',
      application_url: job.application_url || '',
      status: job.status,
      featured: job.featured || false
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await apiService.deleteJob(id);
        fetchJobs();
      } catch (err) {
        console.error('Error deleting job:', err);
        setError('Failed to delete job');
      }
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJobType = selectedJobType === 'all' || job.job_type === selectedJobType;
    return matchesSearch && matchesJobType;
  });

  const jobTypes = ['all', 'full-time', 'part-time', 'contract', 'internship'];

  if (loading) {
    return (
      <div className="job-management">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-management">
      <div className="management-header">
        <h1>Job Management</h1>
        <p>Manage all your job postings from this centralized dashboard</p>
        
        <div className="action-buttons">
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            <Plus size={20} />
            Add New Job
          </button>
        </div>
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedJobType}
          onChange={(e) => setSelectedJobType(e.target.value)}
          className="job-type-select"
        >
          {jobTypes.map(type => (
            <option key={type} value={type}>
              {type === 'all' ? 'All Types' : type.replace('-', ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Job Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingJob ? 'Edit Job' : 'Add New Job'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                  <select
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                  <select
                    name="experience_level"
                    value={formData.experience_level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                  <input
                    type="text"
                    name="salary_range"
                    value={formData.salary_range}
                    onChange={handleInputChange}
                    placeholder="e.g., ₹5,00,000 - ₹8,00,000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities</label>
                  <textarea
                    name="responsibilities"
                    value={formData.responsibilities}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Email</label>
                  <input
                    type="email"
                    name="application_email"
                    value={formData.application_email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application URL</label>
                  <input
                    type="url"
                    name="application_url"
                    value={formData.application_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">Featured</label>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingJob(null);
                    setFormData({
                      title: '',
                      slug: '',
                      company: '',
                      location: '',
                      job_type: 'full-time',
                      experience_level: 'entry',
                      salary_range: '',
                      description: '',
                      requirements: '',
                      responsibilities: '',
                      benefits: '',
                      application_email: '',
                      application_url: '',
                      status: 'active',
                      featured: false
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingJob ? 'Update' : 'Create'} Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="jobs-grid">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💼</div>
            <h3>No jobs found</h3>
            <p>Start by creating your first job posting.</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-content">
                <h3 className="job-title">{job.title}</h3>
                <p className="job-company">{job.company}</p>
                
                <div className="job-location">
                  <MapPin size={14} />
                  {job.location}
                </div>
                
                <p className="job-description">{job.description}</p>
                
                <div className="job-meta">
                  <span className="job-meta-item job-type">
                    {job.job_type?.replace('-', ' ').toUpperCase() || 'FULL-TIME'}
                  </span>
                  <span className="job-meta-item job-experience">
                    {job.experience_level?.toUpperCase() || 'ENTRY'}
                  </span>
                  {job.salary_range && (
                    <span className="job-meta-item job-salary">
                      {job.salary_range}
                    </span>
                  )}
                </div>

                <div className="job-actions">
                  <span className={`status-badge status-${job.status}`}>
                    {job.status?.toUpperCase() || 'ACTIVE'}
                  </span>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleEdit(job)}
                      className="btn-icon btn-edit"
                      title="Edit Job"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="btn-icon btn-delete"
                      title="Delete Job"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default JobManagement;

