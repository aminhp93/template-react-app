import React from 'react';
import map from 'lodash/map';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { IMAGE_TYPES, UPLOAD_TYPES, getMediaTypeFromMimeType } from 'utils/media';
import GalleryItem from './GalleryItem';
import AddMoreFile from './AddMoreFile';

const getItemStyle = (isDragging, draggableStyle, index, size) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'unset',
  marginLeft: index === 0 ? 0 : (size === 'small' ? 10 : 20),

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? 'lightblue' : 'unset',
  display: 'flex',
});

class Gallery extends React.Component {
  onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = this.reorder(
      this.props.files,
      result.source.index,
      result.destination.index,
    );

    this.props.onOrdered(items);
  };

  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  renderFile = ({
    type: mimeType, key, src, loaded, errorType, file_key: fileKey, name: fileName,
  }) => (
    <GalleryItem
      type={getMediaTypeFromMimeType(mimeType)}
      fileName={fileName}
      fileKey={fileKey}
      src={src}
      loaded={loaded}
      errorType={errorType}
      remove={() => this.props.remove(key)}
    />
  );

  render() {
    const {
      files, onAddMore, size, imageOnly, maximumNumOfFiles,
    } = this.props;
    const hasError = files.find((image) => image.errorType);
    const maximumNumExceeded = maximumNumOfFiles && files.length === maximumNumOfFiles;

    return (
      <div>
        <div className={`gallery ${size ? `gallery-${size}` : null}`}>
          {/* {map(images, this.renderImage)} */}
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Droppable droppableId="droppable" direction="horizontal">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                  {...provided.droppableProps}
                >
                  {map(files, (item, index) => (
                    <Draggable key={item.key} draggableId={item.key} index={index}>
                      {(innerProvided, innerSnapshot) => (
                        <div
                          ref={innerProvided.innerRef}
                          {...innerProvided.draggableProps}
                          {...innerProvided.dragHandleProps}
                          style={getItemStyle(
                            innerSnapshot.isDragging,
                            innerProvided.draggableProps.style,
                            index,
                            size,
                          )}
                        >
                          {this.renderFile(item)}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {onAddMore && !maximumNumExceeded && (
            <AddMoreFile onSelect={onAddMore} accept={imageOnly ? IMAGE_TYPES : '*'} />
          )}
        </div>
        {
          hasError && (
            <div className={`gallery--error ${size ? `gallery--error__${size}` : ''}`}>
              {
                files.filter((image) => image.errorType).map((image) => (
                  <div key={image.key}>{image.errorType}</div>
                ))
              }
            </div>
          )
        }
        {
          maximumNumOfFiles && (
            <div className={`gallery--info ${size ? `gallery--info__${size}` : ''}`}>
              (
              {files.length}
              {' '}
              of
              {' '}
              {maximumNumOfFiles}
              {' '}
              selected)
            </div>
          )
        }
      </div>
    );
  }
}

Gallery.propTypes = {
  files: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    src: PropTypes.string,
    loaded: PropTypes.number,
  })),
  onAddMore: PropTypes.func,
  remove: PropTypes.func.isRequired,
  onOrdered: PropTypes.func,
  size: PropTypes.string,
  imageOnly: PropTypes.bool,
  maximumNumOfFiles: PropTypes.number,
};

Gallery.defaultProps = {
  files: [],
  onAddMore: null,
  size: null,
  onOrdered: () => {},
  imageOnly: false,
};

export default Gallery;
