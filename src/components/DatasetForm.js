import React from 'react';
import PropTypes from 'prop-types';
import InputErrorMessage from 'components/InputErrorMessage';

class DatasetForm extends React.Component {
  handleChange = (e) => {
    const dataset = { ...this.props.dataset };
    dataset[e.target.name] = e.target.value;
    this.props.onDatasetChange(dataset);
  };

  render() {
    const { dataset, error } = this.props;
    return (
      <div className="card">
        <div className="card-body">
          <div id="datasetFormName" className="form-group">
            <label className="form-control-label">
              <b className="text-secondary">DATASET NAME</b>
            </label>
            <input
              type="text"
              name="name"
              value={dataset && dataset.name}
              className="form-control"
              onChange={this.handleChange}
            />
            {error.dataset_name && <InputErrorMessage>{error.dataset_name}</InputErrorMessage>}
          </div>
          <div id="datasetFormLink" className="form-group">
            <label className="form-control-label">
              <b className="text-secondary">DATA LINK</b>
            </label>
            <input
              type="text"
              name="link"
              value={dataset && dataset.link}
              className="form-control"
              placeholder="Link to where the data is stored or homepage of a dataset"
              onChange={this.handleChange}
            />
            {error.dataset_link && <InputErrorMessage>{error.dataset_link}</InputErrorMessage>}
          </div>
          <div id="datasetFormAbout" className="form-group">
            <label className="form-control-label">
              <b className="text-secondary">ABOUT</b>
            </label>
            <textarea
              type="text"
              name="description"
              value={dataset && dataset.description}
              className="form-control"
              placeholder="Details about this dataset"
              onChange={this.handleChange}
            />
          </div>
        </div>
      </div>
    );
  }
}

DatasetForm.propTypes = {
  error: PropTypes.objectOf(PropTypes.any),
  dataset: PropTypes.objectOf(PropTypes.any),
  onDatasetChange: PropTypes.func.isRequired,
};

export default DatasetForm;
