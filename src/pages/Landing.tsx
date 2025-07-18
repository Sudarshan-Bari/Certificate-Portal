
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Clock, Shield, Smartphone, Users, Award, ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: FileCheck,
      title: 'Digital Certificates',
      description: 'Get your certificates issued digitally with secure verification'
    },
    {
      icon: Clock,
      title: 'Real-time Tracking',
      description: 'Track your application status in real-time throughout the process'
    },
    {
      icon: Shield,
      title: 'Secure & Verified',
      description: 'All certificates come with digital signatures and security features'
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Access the portal from any device, anywhere, anytime'
    }
  ];

  const certificateTypes = [
    { name: 'Caste Certificate', description: 'Official caste verification document', icon: Award },
    { name: 'Income Certificate', description: 'Income verification for government schemes', icon: Users },
    { name: 'Domicile Certificate', description: 'Proof of residence in the state', icon: FileCheck },
    { name: 'Residence Certificate', description: 'Local residence verification document', icon: Shield }
  ];

  const stats = [
    { number: '50,000+', label: 'Certificates Issued' },
    { number: '98%', label: 'Customer Satisfaction' },
    { number: '2.3 Days', label: 'Average Processing Time' },
    { number: '24/7', label: 'Service Availability' }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Government Employee',
      content: 'Got my income certificate in just 2 days. The process was smooth and transparent.',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'Student',
      content: 'Amazing service! Could track my application status throughout the process.',
      rating: 5
    },
    {
      name: 'Amit Patel',
      role: 'Business Owner',
      content: 'Digital certificates with QR codes make verification so easy. Highly recommended!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="gradient-bg text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Revenue Department</h1>
                <p className="text-blue-100 text-sm">Government Certificate Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Button 
                  onClick={() => navigate('/dashboard')}
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={() => navigate('/auth')}
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => navigate('/auth')}
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-blue-50"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            Trusted by 50,000+ Citizens
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Get Your Government Certificates
            <span className="text-blue-600"> Digitally</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Apply for caste, income, domicile, and residence certificates online. 
            Track your application in real-time and receive digitally signed certificates instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user && (
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              >
                Apply Now <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            )}
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/verify')}
              className="px-8 py-3"
            >
              Verify Certificate
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Digital Certificate Service?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of government services with our secure, fast, and transparent certificate issuance system.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="certificate-card text-center">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certificate Types */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Available Certificate Types
            </h2>
            <p className="text-xl text-gray-600">
              Apply for any of these official government certificates online
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certificateTypes.map((cert, index) => (
              <Card key={index} className="certificate-card hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <cert.icon className="h-10 w-10 text-green-600 mx-auto mb-3" />
                  <CardTitle className="text-lg">{cert.name}</CardTitle>
                  <CardDescription>{cert.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            {!user && (
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Start Your Application
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Thousands of citizens trust our digital certificate service
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="certificate-card">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Get Your Certificate?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied citizens who have received their government certificates digitally. 
            Fast, secure, and completely online.
          </p>
          {!user && (
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3"
            >
              Get Started Today
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Award className="h-6 w-6" />
                <div className="font-bold text-lg">Revenue Department</div>
              </div>
              <p className="text-gray-400">
                Providing digital government services with transparency and efficiency.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Caste Certificate</li>
                <li>Income Certificate</li>
                <li>Domicile Certificate</li>
                <li>Residence Certificate</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Application Status</li>
                <li>Contact Us</li>
                <li>Certificate Verification</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Accessibility</li>
                <li>RTI Information</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Revenue Department. All rights reserved. | Government of India</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
