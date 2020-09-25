import React from 'react';
import ReactHtmlParser from 'react-html-parser';
import PageTitle from 'components/PageTitle';
import LoadingIndicator from 'components/LoadingIndicator';
import AgreementService from 'services/Agreement';

interface IDocumentProps {
  documentKey: string;
}

interface IDocumentState {
  document: any;
  loading: boolean;
}

class Document extends React.Component<IDocumentProps, IDocumentState> {
  constructor(props) {
    super(props);
    this.state = {
      document: null,
      loading: false,
    };
  }

  componentDidMount() {
    this.getDocument();
  }

  async getDocument() {
    this.setState({ loading: true });
    const res = await AgreementService.getDocumentByKey(this.props.documentKey);
    this.setState({
      document: res.data,
      loading: false,
    });
  }

  render() {
    const { document, loading } = this.state;
    if (!document || loading) return <LoadingIndicator />;
    return (
      <>
        <PageTitle title={document.title} />
        <div className="main-page">
          <div className="container static-content">
            <h2 className="page-name">{document.title}</h2>
            <div>{ReactHtmlParser(document.content)}</div>
          </div>
        </div>
      </>
    );
  }
}

export default Document;
