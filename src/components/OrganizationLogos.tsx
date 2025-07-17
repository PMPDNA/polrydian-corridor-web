import { Card } from "@/components/ui/card";
import organizationLogos from "@/assets/organization-logos.jpg";

export const OrganizationLogos = () => {
  const organizations = [
    "World Affairs Council of Miami",
    "World Affairs Council of Americas", 
    "NATO",
    "Concordia",
    "FII Institute",
    "Polish Ministry of Foreign Affairs",
    "Polish Embassy in Washington DC",
    "Miami Dade International Trade Consortium",
    "Enterprise Florida / Select USA",
    "Ukraine Reconstruction",
    "US Commercial Service",
    "SOUTHCOM",
    "CSIS"
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Strategic Partnerships & Affiliations
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Collaborating with leading global institutions to deliver strategic insights and solutions
          </p>
        </div>
        
        {/* Featured Organizations Image */}
        <div className="mb-12 flex justify-center">
          <div className="max-w-4xl w-full">
            <img 
              src={organizationLogos} 
              alt="Strategic partnerships with NATO, CSIS, World Affairs Council, and other global institutions"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {organizations.map((org, index) => (
            <Card 
              key={index}
              className="p-4 flex items-center justify-center min-h-[100px] hover:shadow-lg transition-shadow duration-300 bg-background/50"
            >
              <div className="text-center">
                <div className="text-xs font-medium text-foreground/80 leading-tight">
                  {org}
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Representing strategic partnerships across government, private sector, and international organizations
          </p>
        </div>
      </div>
    </section>
  );
};