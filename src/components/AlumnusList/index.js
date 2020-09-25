import React from 'react';
import PropTypes from 'prop-types';
import Alumnus from './Alumnus';

const AlumnusList = (props) => {
  const havingEmailField = props.alumni[0].email !== undefined;
  // const mainColumnWidth = havingEmailField ? 19 : 23.75;
  const alumnusList = props.alumni && props.alumni.map((alumnus, index) => (
    <Alumnus
      key={index}
      {...alumnus}
      havingEmailField={havingEmailField}
    />
  ));
  return (
    <div id="alumnus-table" className="section listing user-list">
      <div className="row">
        <table className="table table-responsive">
          <thead>
            <tr>
              <th style={{ width: '5%' }} />
              <th className="table-column-md">Fellow</th>
              <th className="table-column-md">Skills</th>
              <th className="table-column-md">Position</th>
              <th className="table-column-md">Company</th>
              <th className="table-column-md">Location</th>
              {havingEmailField && <th className="table-column-xl">Email</th>}
            </tr>
          </thead>
          <tbody>
            {alumnusList}
          </tbody>
        </table>
      </div>
    </div>
  );
};

AlumnusList.propTypes = {
  alumni: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default AlumnusList;
