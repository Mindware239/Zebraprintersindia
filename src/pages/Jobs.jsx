import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Briefcase, Users, Star, Filter, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import './Jobs.css';

const Jobs = () => {
  const { language } = useLanguage();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Sample job data - in a real app, this would come from an API
  const sampleJobs = [
    {
      id: 1,
      title: 'Senior Software Engineer',
      company: 'MINDWARE Technologies',
      location: 'Mumbai, Maharashtra',
      type: 'Full-time',
      department: 'Engineering',
      experience: '3-5 years',
      salary: '₹8,00,000 - ₹12,00,000',
      description: 'We are looking for a Senior Software Engineer to join our dynamic team. You will be responsible for developing and maintaining our barcode printing solutions.',
      requirements: [
        'Bachelor\'s degree in Computer Science or related field',
        '3+ years of experience in software development',
        'Proficiency in React, Node.js, and MySQL',
        'Experience with barcode technologies preferred'
      ],
      postedDate: '2024-01-15',
      isUrgent: false
    },
    {
      id: 2,
      title: 'Sales Manager',
      company: 'MINDWARE Technologies',
      location: 'Delhi, NCR',
      type: 'Full-time',
      department: 'Sales',
      experience: '2-4 years',
      salary: '₹6,00,000 - ₹10,00,000',
      description: 'Join our sales team and help businesses implement cutting-edge barcode solutions. Drive growth and build lasting client relationships.',
      requirements: [
        'Bachelor\'s degree in Business or related field',
        '2+ years of sales experience',
        'Strong communication and negotiation skills',
        'Knowledge of barcode/printing industry preferred'
      ],
      postedDate: '2024-01-12',
      isUrgent: true
    },
    {
      id: 3,
      title: 'Technical Support Specialist',
      company: 'MINDWARE Technologies',
      location: 'Bangalore, Karnataka',
      type: 'Full-time',
      department: 'Support',
      experience: '1-3 years',
      salary: '₹4,00,000 - ₹7,00,000',
      description: 'Provide technical support to our clients using barcode printing solutions. Help troubleshoot issues and ensure customer satisfaction.',
      requirements: [
        'Diploma or Bachelor\'s degree in IT or related field',
        '1+ years of technical support experience',
        'Strong problem-solving skills',
        'Experience with printer hardware preferred'
      ],
      postedDate: '2024-01-10',
      isUrgent: false
    },
    {
      id: 4,
      title: 'Marketing Coordinator',
      company: 'MINDWARE Technologies',
      location: 'Pune, Maharashtra',
      type: 'Part-time',
      department: 'Marketing',
      experience: '1-2 years',
      salary: '₹3,00,000 - ₹5,00,000',
      description: 'Support our marketing team in promoting our barcode solutions. Create content, manage social media, and coordinate events.',
      requirements: [
        'Bachelor\'s degree in Marketing or related field',
        '1+ years of marketing experience',
        'Creative thinking and content creation skills',
        'Social media management experience'
      ],
      postedDate: '2024-01-08',
      isUrgent: false
    },
    {
      id: 5,
      title: 'DevOps Engineer',
      company: 'MINDWARE Technologies',
      location: 'Hyderabad, Telangana',
      type: 'Full-time',
      department: 'Engineering',
      experience: '2-4 years',
      salary: '₹7,00,000 - ₹11,00,000',
      description: 'Manage our cloud infrastructure and deployment pipelines. Ensure high availability and performance of our barcode solutions.',
      requirements: [
        'Bachelor\'s degree in Computer Science or related field',
        '2+ years of DevOps experience',
        'Experience with AWS, Docker, and Kubernetes',
        'Knowledge of CI/CD pipelines'
      ],
      postedDate: '2024-01-05',
      isUrgent: true
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchJobs = async () => {
      try {
        setLoading(true);
        // In a real app, this would be: const data = await apiService.getJobs();
        setJobs(sampleJobs);
        setFilteredJobs(sampleJobs);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    let currentJobs = [...jobs];

    if (searchQuery) {
      currentJobs = currentJobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedLocation !== 'all') {
      currentJobs = currentJobs.filter(job => job.location.includes(selectedLocation));
    }

    if (selectedDepartment !== 'all') {
      currentJobs = currentJobs.filter(job => job.department === selectedDepartment);
    }

    if (selectedType !== 'all') {
      currentJobs = currentJobs.filter(job => job.type === selectedType);
    }

    setFilteredJobs(currentJobs);
  }, [searchQuery, selectedLocation, selectedDepartment, selectedType, jobs]);

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'Mumbai', label: 'Mumbai' },
    { value: 'Delhi', label: 'Delhi' },
    { value: 'Bangalore', label: 'Bangalore' },
    { value: 'Pune', label: 'Pune' },
    { value: 'Hyderabad', label: 'Hyderabad' }
  ];

  const departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Support', label: 'Support' },
    { value: 'Marketing', label: 'Marketing' }
  ];

  const jobTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Contract', label: 'Contract' }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="jobs-page-container">
        <div className="jobs-loading">
          <div className="loading-spinner"></div>
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="jobs-page-container">
        <div className="jobs-error">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="jobs-page-container">
      {/* Hero Section */}
      <div className="jobs-hero">
        <div className="jobs-hero-content">
          <h1>Join Our Team</h1>
          <p>Build the future of barcode technology with MINDWARE Technologies</p>
          <div className="jobs-stats">
            <div className="stat">
              <Users size={24} />
              <span>50+ Employees</span>
            </div>
            <div className="stat">
              <Briefcase size={24} />
              <span>5 Open Positions</span>
            </div>
            <div className="stat">
              <Star size={24} />
              <span>4.8/5 Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="jobs-search-filters">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search jobs, companies, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button 
          className="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          Filters
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="jobs-filters">
          <div className="filter-group">
            <label>Location</label>
            <select 
              value={selectedLocation} 
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              {locations.map(loc => (
                <option key={loc.value} value={loc.value}>{loc.label}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Department</label>
            <select 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              {departments.map(dept => (
                <option key={dept.value} value={dept.value}>{dept.label}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Job Type</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {jobTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="jobs-list">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <div key={job.id} className={`job-card ${job.isUrgent ? 'urgent' : ''}`}>
              {job.isUrgent && <div className="urgent-badge">Urgent</div>}
              
              <div className="job-header">
                <div className="job-title-section">
                  <h3>{job.title}</h3>
                  <p className="company-name">{job.company}</p>
                </div>
                <div className="job-meta">
                  <span className="job-salary">{job.salary}</span>
                  <span className="job-posted">{formatDate(job.postedDate)}</span>
                </div>
              </div>

              <div className="job-details">
                <div className="job-detail">
                  <MapPin size={16} />
                  <span>{job.location}</span>
                </div>
                <div className="job-detail">
                  <Clock size={16} />
                  <span>{job.type}</span>
                </div>
                <div className="job-detail">
                  <Briefcase size={16} />
                  <span>{job.department}</span>
                </div>
                <div className="job-detail">
                  <Users size={16} />
                  <span>{job.experience}</span>
                </div>
              </div>

              <div className="job-description">
                <p>{job.description}</p>
              </div>

              <div className="job-requirements">
                <h4>Key Requirements:</h4>
                <ul>
                  {job.requirements.slice(0, 3).map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="job-actions">
                <button className="apply-btn">Apply Now</button>
                <button className="save-btn">Save Job</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-jobs">
            <Briefcase size={48} />
            <h2>No jobs found</h2>
            <p>Try adjusting your search criteria or check back later for new opportunities.</p>
          </div>
        )}
      </div>

      {/* Why Work With Us Section */}
      <div className="why-work-with-us">
        <h2>Why Work With Us?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <Star size={32} />
            <h3>Growth Opportunities</h3>
            <p>Advance your career with continuous learning and development programs.</p>
          </div>
          <div className="benefit-card">
            <Users size={32} />
            <h3>Great Team</h3>
            <p>Work with talented professionals in a collaborative and supportive environment.</p>
          </div>
          <div className="benefit-card">
            <Briefcase size={32} />
            <h3>Innovation</h3>
            <p>Be part of cutting-edge technology solutions in the barcode industry.</p>
          </div>
          <div className="benefit-card">
            <Clock size={32} />
            <h3>Work-Life Balance</h3>
            <p>Flexible working hours and remote work options for better work-life balance.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
