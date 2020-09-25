import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { List, Tooltip } from 'antd';

import ConfirmModal from './ConfirmModal';
import { ModalKey } from 'types';
import { format } from 'markdown';
import ReactHtmlParser from 'react-html-parser';


interface IProps {
  selectedConversation: any;
}

interface IState {
    show: boolean;
}

class MarkdownGuide extends React.PureComponent<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            show: false
        }
    }

    renderItem = (item) => {
        return (
            <div className='m-markdown-guide-item'>
                <div className='m-markdown-guide-element'>
                    {ReactHtmlParser(format(item.element))}
                </div>
                <div>
                    {item.markdownSyntax.map(i => {
                        return <div key={i}>{i}</div>
                    })}
                </div>
            </div>
        )
    }
    
  render() {
    const { show } = this.state;
    const markdownGuideList = [
        {
            element: 'Element',
            markdownSyntax: ['Markdown Syntax'],
            isTitle: true
        },
        {
            element: '**Bold**',
            markdownSyntax: ['**bold text**']
        },
        {
            element: '*Italic*',
            markdownSyntax: ['*italicized text*']
        },
        {
            element: '~~Strikethrough~~',
            markdownSyntax: ['~~strikethrough text~~']
        },
        {
            element: '> Blockquote',
            markdownSyntax: ['> blockquote']
        },
        {
            element: 'Ordered List',
            markdownSyntax: [
                '1. First item',
                '2. Second item',
                '3. Third item'
            ]
        },
        {
            element: 'Unordered List',
            markdownSyntax: [
                '- First item',
                '- Second item',
                '- Third item'
            ]
        },
        {
            element: '`Code`',
            markdownSyntax: ['`code`']
        },
        {
            element: '[Title]()',
            markdownSyntax: [`[title](https://www.example.com)`]
        },
    ]
    return (
        <>
            <Tooltip title="Markdown guide will help you experience all the formatting that was supported on the platform">
                <div className="m-message-compose__buttons-text" onClick={() => this.setState({ show: true })}>
                    Aa
                    <div className="m-message-compose__buttons-icon">?</div>
                </div>
            </Tooltip>

            {show && <ConfirmModal
                className="m-markdown-guide"
                modalKey={ModalKey.MARKDOWN_GUIDE}
                title="Markdown Guide"
                onCancel={() => this.setState({ show: false })}
                footer={null}
            >
                <div className="m-markdown-guide-container">
                    
                    <List
                        size="large"
                        header={null}
                        footer={null}
                        bordered
                        dataSource={markdownGuideList}
                        renderItem={i => <List.Item className={i.isTitle ? 'title' : ''}>{this.renderItem(i)}</List.Item>}
                    />
                </div>
            </ConfirmModal>}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  const conversations = get(state, 'conversations') || {};
  const selectedConversationId = get(state, 'selectedConversationId');
  return {
    selectedConversation: conversations[selectedConversationId] || {},
  };
};

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sentry.withProfiler(MarkdownGuide, { name: "MarkdownGuide"}));
