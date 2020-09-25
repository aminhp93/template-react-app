import * as React from 'react';
import PageTitle from 'components/PageTitle';
import AlumRec from 'components/AlumRec';

const AlumniRec = () => (
  <div className="bg-gray" style={{ flexGrow: 1 }}>
    <div className="container main-page recommendation">
      <PageTitle title="Alumni Recommendations" />
      <AlumRec />
    </div>
  </div>
);

export default AlumniRec;
