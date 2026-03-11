import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ObfuscatedEmail = ({ user, domain, label }) => {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(true);
  }, []);

  if (!revealed) {
    return <span>[이메일 보호됨]</span>;
  }

  if (!user || !domain) {
    return <span>[이메일 보호됨]</span>;
  }

  const email = `${user}@${domain}`;
  return (
    <a href={`mailto:${email}`}>
      {label || email}
    </a>
  );
};

ObfuscatedEmail.propTypes = {
  user: PropTypes.string.isRequired,
  domain: PropTypes.string.isRequired,
  label: PropTypes.string,
};

ObfuscatedEmail.defaultProps = {
  label: null,
};

export default ObfuscatedEmail;
