import * as React from 'react';

const SuccessMessage = () => (
  <>
    <div className="text-center mb-4">
      Your password is successfully updated. You can now login using the new
      password.
    </div>
    <div className="text-center mb-4">
      <a href="/login">Go to Login</a>
    </div>
  </>
);

export default SuccessMessage;
