import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  ArrowRight, 
  Users, 
  Briefcase, 
  Star, 
  CheckCircle, 
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Award,
  Target,
  MessageSquare
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Navbar />
      <Hero />

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">10K+</div>
              <div className="text-muted-foreground">Active Freelancers</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-secondary">5K+</div>
              <div className="text-muted-foreground">Companies</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-accent">25K+</div>
              <div className="text-muted-foreground">Projects Completed</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">4.9★</div>
              <div className="text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-6 mb-16">
            <Badge variant="outline" className="text-sm">
              ⚡ Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From intelligent matching to secure payments, we've built the complete platform for modern freelance collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50">
              <CardHeader>
                <div className="h-12 w-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <CardTitle>AI-Powered Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our advanced algorithm analyzes skills, experience, and preferences to find perfect matches between freelancers and projects.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-secondary/50">
              <CardHeader>
                <div className="h-12 w-12 bg-gradient-to-r from-secondary to-accent rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Secure Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Milestone-based payments with escrow protection ensure freelancers get paid and companies get results.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-accent/50">
              <CardHeader>
                <div className="h-12 w-12 bg-gradient-to-r from-accent to-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Real-time Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Built-in messaging, file sharing, and project tracking tools keep everyone aligned and productive.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50">
              <CardHeader>
                <div className="h-12 w-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Analytics & Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive dashboards provide insights into performance, earnings, and market trends.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-secondary/50">
              <CardHeader>
                <div className="h-12 w-12 bg-gradient-to-r from-secondary to-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Quality Assurance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Built-in assessments, reviews, and dispute resolution ensure high-quality outcomes for all parties.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-accent/50">
              <CardHeader>
                <div className="h-12 w-12 bg-gradient-to-r from-accent to-secondary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Global Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect with talent and opportunities worldwide with multi-currency support and localization.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-r from-muted/50 to-secondary/10">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-6 mb-16">
            <Badge variant="outline">
              🔄 Simple Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              How SkillBridge Pro Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">Create Your Profile</h3>
              <p className="text-muted-foreground">
                Showcase your skills, experience, and portfolio. Companies post detailed project requirements.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Get Matched</h3>
              <p className="text-muted-foreground">
                Our AI finds the perfect matches based on skills, budget, timeline, and working preferences.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">Collaborate & Succeed</h3>
              <p className="text-muted-foreground">
                Work together using our platform's tools, track progress, and get paid securely upon completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-6 mb-16">
            <Badge variant="outline">
              💬 Success Stories
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              What our users say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "SkillBridge Pro transformed how we find and work with freelancers. The matching is incredibly accurate!"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
                    SJ
                  </div>
                  <div>
                    <div className="font-semibold">Sarah Johnson</div>
                    <div className="text-sm text-muted-foreground">CTO, TechCorp</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "I've tripled my income since joining. The quality of projects and clients is outstanding."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center text-white font-semibold">
                    MR
                  </div>
                  <div>
                    <div className="font-semibold">Michael Rodriguez</div>
                    <div className="text-sm text-muted-foreground">Full-Stack Developer</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "The project management tools and secure payments make collaboration seamless and worry-free."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center text-white font-semibold">
                    LC
                  </div>
                  <div>
                    <div className="font-semibold">Lisa Chen</div>
                    <div className="text-sm text-muted-foreground">Product Manager</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to transform your career?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of successful freelancers and companies who are already using SkillBridge Pro to achieve their goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-4 group" asChild>
                <Link to="/auth/register">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4" asChild>
                <Link to="/auth/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SkillBridge Pro
            </div>
            <p className="text-muted-foreground">
              Connecting talent with opportunity, worldwide.
            </p>
            <div className="text-sm text-muted-foreground">
              © 2024 SkillBridge Pro. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;