import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaLock, 
  FaFolder, 
  FaFile, 
  FaShieldAlt, 
  FaCloud, 
  FaUsers,
  FaArrowRight,
  FaCheckCircle,
  FaUpload,
  FaSearch,
  FaDownload
} from 'react-icons/fa';
import { FaVault } from 'react-icons/fa6';
import { useUserStore } from '../store';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();

  const features = [
    {
      icon: FaShieldAlt,
      title: 'Secure Storage',
      description: 'Your files are encrypted and stored securely with enterprise-grade security measures.'
    },
    {
      icon: FaFolder,
      title: 'Organized Collections',
      description: 'Create collections to organize your files efficiently and access them quickly.'
    },
    {
      icon: FaCloud,
      title: 'Cloud Access',
      description: 'Access your files from anywhere, anytime with our reliable cloud infrastructure.'
    },
    {
      icon: FaLock,
      title: 'Privacy First',
      description: 'Your data remains private and secure. Only you have access to your personal vault.'
    }
  ];

  const steps = [
    {
      icon: FaUsers,
      title: 'Create Account',
      description: 'Sign up for your personal Tijori account in seconds.'
    },
    {
      icon: FaUpload,
      title: 'Upload Files',
      description: 'Upload your documents, images, and files securely to your vault.'
    },
    {
      icon: FaFolder,
      title: 'Organize',
      description: 'Create collections to organize your files the way you want.'
    },
    {
      icon: FaSearch,
      title: 'Access Anywhere',
      description: 'Find and access your files quickly from any device.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Hero Content */}
          <div className="mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-600 p-6 rounded-full shadow-lg">
                <FaVault className="w-16 h-16 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Personal
              <span className="text-blue-600 block">Digital Vault</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Store, organize, and access your important files securely with <span className="font-semibold text-blue-600">Tijori</span>. 
              Your trusted digital safe for all your precious documents and memories.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center justify-center space-x-3 font-medium text-base shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <FaFolder className="w-5 h-5" />
                    <span>Go to Dashboard</span>
                  </button>
                  <button
                    onClick={() => navigate('/collection')}
                    className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 flex items-center justify-center space-x-3 font-medium text-base shadow-md hover:shadow-lg"
                  >
                    <span>View Collections</span>
                    <FaArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center justify-center space-x-3 font-medium text-base shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <span>Get Started Free</span>
                    <FaArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 flex items-center justify-center space-x-3 font-medium text-base shadow-md hover:shadow-lg"
                  >
                    <span>Sign In</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">Secure Encryption</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600">Available Access</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">∞</div>
              <div className="text-gray-600">Storage Capacity</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Why Choose Tijori?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Built with security, simplicity, and reliability at its core
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group text-center p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-white">
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-5 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-9 h-9 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Get started with your digital vault in 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="bg-white p-8 rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 hover:border-blue-200">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center font-bold text-xl shadow-lg">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 -right-3 w-6 h-0.5 bg-gradient-to-r from-blue-300 to-indigo-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem & Solution Story */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Stop Searching, Start Finding
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transform your chaotic file system into an organized, intelligent vault
            </p>
          </div>

          {/* Quick Story */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-20">
            {/* The Problem */}
            <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold text-red-800 mb-6 flex items-center">
                <span className="text-3xl mr-3">😤</span>
                The Daily Struggle
              </h3>
              <div className="space-y-6">
                <p className="text-red-700 text-lg leading-relaxed italic">
                  "Where did I save that contract? Was it in Documents → Work → Projects → Client folders? 
                  Or Downloads? Maybe I emailed it to myself..."
                </p>
                <div className="bg-red-200/60 backdrop-blur-sm p-6 rounded-xl border border-red-300/50">
                  <div className="text-sm text-red-900 space-y-3 font-medium">
                    <div className="flex items-center"><span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span><strong>2 hours/week</strong> spent searching for files</div>
                    <div className="flex items-center"><span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span><strong>Duplicate files</strong> everywhere</div>
                    <div className="flex items-center"><span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span><strong>Nested folders</strong> 5+ levels deep</div>
                    <div className="flex items-center"><span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span><strong>Lost files</strong> in email attachments</div>
                  </div>
                </div>
              </div>
            </div>

            {/* The Solution */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
                <span className="text-3xl mr-3">✨</span>
                The Tijori Way
              </h3>
              <div className="space-y-6">
                <p className="text-blue-700 text-lg leading-relaxed italic">
                  "I need my house insurance document. Let me search 'house insurance'... 
                  Found it! It's in Property, Tax, and Insurance collections simultaneously."
                </p>
                <div className="bg-blue-200/60 backdrop-blur-sm p-6 rounded-xl border border-blue-300/50">
                  <div className="text-sm text-blue-900 space-y-3 font-medium">
                    <div className="flex items-center"><span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span><strong>Instant search</strong> across all collections</div>
                    <div className="flex items-center"><span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span><strong>One file</strong> in multiple collections</div>
                    <div className="flex items-center"><span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span><strong>No duplicates</strong> ever</div>
                    <div className="flex items-center"><span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span><strong>Smart organization</strong> that makes sense</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Insight */}
          <div className="bg-gradient-to-r from-green-500 via-blue-500 to-blue-600 rounded-3xl p-10 text-white text-center shadow-2xl">
            <div className="max-w-4xl mx-auto">
              <div className="text-4xl mb-6">💡</div>
              <h3 className="text-3xl font-bold mb-6 tracking-tight">The Game Changer</h3>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8 leading-relaxed">
                Collections aren't folders. They're <strong className="text-yellow-300">smart labels</strong> that let one file exist in multiple contexts without duplication.
              </p>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 inline-block border border-white/20">
                <div className="text-xl font-bold mb-4">
                  📄 <span className="text-yellow-300">house_contract.pdf</span> lives in:
                </div>
                <div className="grid grid-cols-2 gap-3 text-base">
                  <div className="bg-white/10 rounded-lg p-3">🏠 Property Documents</div>
                  <div className="bg-white/10 rounded-lg p-3">📋 Tax & Financial</div>
                  <div className="bg-white/10 rounded-lg p-3">💼 Legal Contracts</div>
                  <div className="bg-white/10 rounded-lg p-3">🏛️ Important Papers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Experience the Tijori Difference
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              See how collections make file organization intuitive and powerful
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Traditional Folder Structure */}
            <div>
              <h3 className="text-2xl font-bold text-red-700 mb-8 flex items-center">
                <span className="bg-red-100 p-3 rounded-xl mr-4 text-2xl">❌</span>
                Traditional Folder Chaos
              </h3>
              <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-2xl p-8 shadow-lg">
                <div className="font-mono text-sm space-y-2 text-red-800">
                  <div className="font-semibold">📁 Documents/</div>
                  <div className="ml-4">📁 Work/</div>
                  <div className="ml-8">📁 Projects/</div>
                  <div className="ml-12">📁 Client_A/</div>
                  <div className="ml-16">📁 Contracts/</div>
                  <div className="ml-20 text-red-600">📄 contract_v1.pdf</div>
                  <div className="ml-20 text-red-600">📄 contract_v2.pdf</div>
                  <div className="ml-20 text-red-600 font-medium">📄 contract_FINAL.pdf</div>
                  <div className="ml-4">📁 Personal/</div>
                  <div className="ml-8">📁 Taxes/</div>
                  <div className="ml-12">📁 2023/</div>
                  <div className="ml-16 text-red-600">📄 tax_form.pdf</div>
                  <div className="ml-8">📁 Insurance/</div>
                  <div className="ml-12 text-red-600">📄 house_insurance.pdf</div>
                  <div className="ml-4">📁 Misc/</div>
                  <div className="ml-8 text-red-600">📄 important_stuff.pdf</div>
                </div>
                <div className="mt-6 p-4 bg-red-200/60 rounded-xl border border-red-300/50">
                  <p className="text-red-800 text-sm font-medium">
                    <strong>Problems:</strong> Duplicate files, deep nesting, hard to find cross-category items
                  </p>
                </div>
              </div>
            </div>

            {/* Tijori Collection Structure */}
            <div>
              <h3 className="text-2xl font-bold text-green-700 mb-8 flex items-center">
                <span className="bg-green-100 p-3 rounded-xl mr-4 text-2xl">✅</span>
                Tijori Smart Collections
              </h3>
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 rounded-2xl p-8 shadow-lg">
                <div className="space-y-5">
                  <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-green-200/50 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <FaFolder className="w-5 h-5 text-green-600 mr-3" />
                        <strong className="text-green-800 font-bold">💼 Work & Contracts</strong>
                      </div>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full font-medium">12 files</span>
                    </div>
                    <div className="text-sm text-green-700 space-y-2 ml-8">
                      <div className="font-medium">📄 contract_FINAL.pdf</div>
                      <div>📄 project_proposal.docx</div>
                      <div>📄 client_communication.pdf</div>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-blue-200/50 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <FaFolder className="w-5 h-5 text-blue-600 mr-3" />
                        <strong className="text-blue-800 font-bold">🏠 Property & Legal</strong>
                      </div>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full font-medium">8 files</span>
                    </div>
                    <div className="text-sm text-blue-700 space-y-2 ml-8">
                      <div>📄 house_insurance.pdf <span className="text-xs text-blue-500">↗️ Also in Insurance</span></div>
                      <div className="font-medium">📄 contract_FINAL.pdf <span className="text-xs text-blue-500">↗️ Also in Work</span></div>
                      <div>📄 property_deed.pdf</div>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-purple-200/50 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <FaFolder className="w-5 h-5 text-purple-600 mr-3" />
                        <strong className="text-purple-800 font-bold">📋 Tax & Financial</strong>
                      </div>
                      <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full font-medium">15 files</span>
                    </div>
                    <div className="text-sm text-purple-700 space-y-2 ml-8">
                      <div>📄 tax_form.pdf</div>
                      <div>📄 house_insurance.pdf <span className="text-xs text-purple-500">↗️ Also in Property</span></div>
                      <div>📄 investment_summary.xlsx</div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-green-200/60 rounded-xl border border-green-300/50">
                  <p className="text-green-800 text-sm font-medium">
                    <strong>Benefits:</strong> One file, multiple collections. No duplicates. Contextual organization.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Ready to Secure Your Files?
          </h2>
          <p className="text-xl mb-10 text-blue-100 leading-relaxed max-w-2xl mx-auto">
            Join thousands of users who trust Tijori with their important documents
          </p>
          
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/register"
                className="w-full sm:w-auto px-10 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium text-base shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Create Your Vault Today
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-10 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300 font-medium text-base shadow-lg hover:shadow-xl"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FaVault className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold">Tijori</span>
              </div>
              <p className="text-gray-400">
                Your trusted digital vault for secure file storage and organization.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Secure File Storage</li>
                <li>Collection Management</li>
                <li>Cloud Access</li>
                <li>File Sharing</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Security</h4>
              <ul className="space-y-2 text-gray-400">
                <li>End-to-End Encryption</li>
                <li>Secure Authentication</li>
                <li>Privacy Protection</li>
                <li>Regular Backups</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Tijori. All rights reserved. Your files, your security, your vault.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;