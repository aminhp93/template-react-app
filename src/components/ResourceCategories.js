import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import CATEGORY_ICON_URL from '@img/ic-category.svg';


const ResourceCategories = (props) => (
  <>
    <div className="sidebar-button menu mt-3">
      <img className="mr-2" src={CATEGORY_ICON_URL} alt="Category icon" width="16px" />
      CATEGORIES
    </div>
    <div
      className={clsx(
        'sidebar-filter-item pointer',
        { active: props.categoryFilters.length === 0 },
      )}
      onClick={() => props.handleCategoryFilterChange([])}
    >
      All
      {props.categoryFilters.length === 0
        && <i className="fa fa-check pull-right mr-2 mt-1" />}
    </div>
    {props.categories.length > 0 && props.categories.map((category) => (
      <div
        key={category.id}
        className={clsx(
          'sidebar-filter-item pointer',
          { active: props.categoryFilters.includes(category.slug) },
        )}
        onClick={() => props.toggleCategory(category.slug)}
      >
        {category.name}
        {props.categoryFilters.includes(category.slug)
          && <i className="fa fa-check pull-right mr-2 mt-1" />}
      </div>
    ))}
  </>
);

ResourceCategories.propTypes = {
  categoryFilters: PropTypes.arrayOf(PropTypes.string),
  categories: PropTypes.arrayOf(PropTypes.object),
  handleCategoryFilterChange: PropTypes.func,
};

export default ResourceCategories;
