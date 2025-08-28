import { HeroParallax } from "@/components/ui/hero-parallax";
import { Navbar } from "@/components/ui/navbar";
import { Features } from "@/components/ui/features";
import { CTA } from "@/components/ui/cta";
import { Footer } from "@/components/ui/footer";

const page = () => {
  return (
    <div>
      <Navbar />
      <HeroParallax
        products={[
          { title: "Chainsaw Man", link: "#", thumbnail: "/Hero4.jpg" },
          { title: "Naruto", link: "#", thumbnail: "/Hero8.jpg" },
          { title: "Jujutsu Kaisen", link: "#", thumbnail: "/Hero3.jpg" },
          { title: "Attack on Titan", link: "#", thumbnail: "/Hero1.webp" },
          { title: "Solo Leveling", link: "#", thumbnail: "/Hero6.jpg" },
          { title: "Hunter x Hunter", link: "#", thumbnail: "/Hero9.jpg" },
          { title: "Kaiju No. 8", link: "#", thumbnail: "/Hero5.jpg" },
          { title: "One Piece", link: "#", thumbnail: "/Hero7.jpg" },
          { title: "Demon Slayer: Kimetsu no Yaiba", link: "#", thumbnail: "/Hero2.webp" },
          { title: "Haikyuu", link: "#", thumbnail: "/Hero10.jpg" },
        ]}
      />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
};

export default page;
