import React, { useEffect } from "react";
import { navigate } from "gatsby";

const IndexPage = () => {
  useEffect(() => {
    navigate('', { replace: true });
  }, []);

  return <div>Redirecting...</div>;
};

export default IndexPage;
