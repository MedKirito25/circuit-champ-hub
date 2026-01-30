import { Bot, Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">
                  ITBS <span className="text-primary">Robotics</span>
                </h3>
                <p className="text-xs text-muted-foreground">Tournament 2026</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              IT Business School's premier robotics competition showcasing the next generation of engineering talent.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2">
              <a href="/brackets" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Live Brackets
              </a>
              <a href="/teams" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                All Teams
              </a>
              <a href="/robots" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Robots Gallery
              </a>
              <a href="/admin" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Admin Panel
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground">Connect</h4>
            <div className="flex items-center gap-3">
              <a
                href="mailto:robotics@itbs.school"
                className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 IT Business School. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span>Live Tournament Updates</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
