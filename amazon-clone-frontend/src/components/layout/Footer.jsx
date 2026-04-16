import { Link } from 'react-router-dom';

const FOOTER_LINKS = [
  {
    title: 'Shop',
    links: [
      { label: 'All Products', to: '/products' },
      { label: 'Prime', to: '/prime' },
      { label: 'Cart', to: '/cart' },
      { label: 'Wishlist', to: '/wishlist' },
    ]
  },
  {
    title: 'Account',
    links: [
      { label: 'Your Account', to: '/login' },
      { label: 'Your Orders', to: '/orders' },
      { label: 'Checkout', to: '/checkout' },
      { label: 'Create Account', to: '/signup' },
    ]
  },
  {
    title: 'Support',
    links: [
      { label: 'Customer Service', to: '/customer-service' },
      { label: 'Returns & Help', to: '/customer-service' },
      { label: 'Payments Help', to: '/customer-service' },
      { label: 'Delivery Help', to: '/customer-service' },
    ]
  },
  {
    title: 'Connect',
    links: [
      { label: 'Facebook', href: 'https://www.facebook.com', external: true },
      { label: 'X (Twitter)', href: 'https://x.com', external: true },
      { label: 'Instagram', href: 'https://www.instagram.com', external: true },
    ]
  },
];

export default function Footer() {
  return (
    <footer>
      {/* Back to top */}
      <div
        style={{ backgroundColor: '#37475A', color: 'white', textAlign: 'center', padding: '14px', cursor: 'pointer', fontSize: 13 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        Back to top
      </div>

      {/* Main footer */}
      <div style={{ backgroundColor: '#232F3E', color: '#DDD', padding: '40px 16px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32 }}>
          {FOOTER_LINKS.map(({ title, links }) => (
            <div key={title}>
              <h3 style={{ color: 'white', fontSize: 14, fontWeight: 700, marginBottom: 12, margin: '0 0 12px' }}>
                {title}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {links.map(link => (
                  <li key={link.label} style={{ marginBottom: 6 }}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        style={{ color: '#CCC', fontSize: 13, textDecoration: 'none' }}
                        onMouseEnter={e => e.target.style.color = '#FF9900'}
                        onMouseLeave={e => e.target.style.color = '#CCC'}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noreferrer noopener' : undefined}
                        style={{ color: '#CCC', fontSize: 13, textDecoration: 'none' }}
                        onMouseEnter={e => e.target.style.color = '#FF9900'}
                        onMouseLeave={e => e.target.style.color = '#CCC'}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ backgroundColor: '#131921', color: '#999', padding: '16px', textAlign: 'center', fontSize: 12 }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: 'white', fontWeight: 900, fontSize: 18 }}>amazon</span>
          <span style={{ color: '#FF9900', fontWeight: 900, fontSize: 18 }}>.in</span>
        </div>
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} Amazon.in — Demo project. All product images from Unsplash.
        </p>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Conditions of Use & Sale', to: '/customer-service' },
            { label: 'Privacy Notice', to: '/customer-service' },
            { label: 'Interest-Based Ads Notice', to: '/customer-service' },
          ].map(t => (
            <Link key={t.label} to={t.to} style={{ color: '#999', fontSize: 11, textDecoration: 'none' }}>{t.label}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
