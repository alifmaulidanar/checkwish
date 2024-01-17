import { useState, useEffect, useCallback } from "react";
import { Drawer, Divider } from "antd";

const NavbarLogo = () => (
  <a href="https://alifmaulidanar.com" className="text-xl">
    CheckWish
  </a>
);

const NavbarLinks = () => (
  <div className="flex flex-col overflow-hidden text-right sm:text-lg md:gap-8 md:flex-row lg:flex-row md:flex">
    <a id="nav_about" href="#about">
      Wishes
    </a>
    <Divider className="block sm:hidden" />
  </div>
);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [navbarColor, setNavbarColor] = useState("text-[#0B2447]");
  const [navbarLogo, setNavbarLogo] = useState("/profile/logo.svg");
  const [hamburgerMenu, setHamburgerMenu] = useState(
    "/icons/hamburger-menu.svg"
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(window.innerWidth / 2);

  const updateDrawerWidth = useCallback(() => {
    setDrawerWidth(window.innerWidth / 2);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", updateDrawerWidth);
    return () => window.removeEventListener("resize", updateDrawerWidth);
  }, [updateDrawerWidth]);

  const HamburgerMenu = ({ onClick }) => (
    <div className="cursor-pointer md:hidden" onClick={onClick}>
      <img src={hamburgerMenu} alt="Menu" width="24" height="24" />
    </div>
  );

  const updateScrolledState = useCallback(() => {
    const offset = window.scrollY;
    setScrolled(offset > 0);
  }, []);

  const updateNavbarStyle = useCallback(() => {
    const contactSection = document.getElementById("contact");
    if (contactSection && window.pageYOffset >= contactSection.offsetTop - 50) {
      setNavbarColor("text-[#EFEFEF]");
      setNavbarLogo("/profile/logo-white.svg");
      setHamburgerMenu("/icons/hamburger-menu-white.svg");
    } else {
      setNavbarColor("text-[#0B2447]");
      setNavbarLogo("/profile/logo.svg");
      setHamburgerMenu("/icons/hamburger-menu.svg");
    }
  }, []);

  const handleScroll = useCallback(() => {
    updateScrolledState();
    updateNavbarStyle();
  }, [updateScrolledState, updateNavbarStyle]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div
      className={`backdrop-filter backdrop-blur-lg fixed z-50 w-full bg-transparent ${
        scrolled ? "shadow-md" : ""
      }`}
      id="navbar"
    >
      <nav
        className={`bg-transparent py-5 container flex items-center justify-between px-8 lg:px-20 mx-auto ${navbarColor}`}
      >
        <NavbarLogo logo={navbarLogo} />
        <HamburgerMenu onClick={toggleMenu} />
        <Drawer
          title="Menu"
          placement="right"
          closable={false}
          onClose={toggleMenu}
          open={isMenuOpen}
          zIndex={10000}
          width={drawerWidth}
        >
          <NavbarLinks />
        </Drawer>
        <div className="hidden md:block">
          <NavbarLinks />
        </div>
      </nav>
    </div>
  );
}
