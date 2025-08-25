import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { profileService } from '../../services/profileService';
import { PortfolioItem } from '../../services/types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Loader2, Plus, ExternalLink, Github } from 'lucide-react';

const PortfolioList = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await profileService.getPortfolio();
        setPortfolio(data);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Portfolio</h1>
        <Button asChild>
          <Link to="/profile/portfolio/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Link>
        </Button>
      </div>

      {portfolio.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No portfolio items yet</p>
            <Button asChild>
              <Link to="/profile/portfolio/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-1">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {item.description}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {item.technologies.slice(0, 3).map((tech, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {item.technologies.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.technologies.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.links.map((link, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.type === 'github' ? (
                          <Github className="h-3 w-3" />
                        ) : (
                          <ExternalLink className="h-3 w-3" />
                        )}
                      </a>
                    </Button>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-muted-foreground">
                    {item.duration || 'Duration not specified'}
                  </span>
                  <Button size="sm" variant="ghost" asChild>
                    <Link to={`/profile/portfolio/${item.id}`}>Edit</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortfolioList;