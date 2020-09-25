import * as formatter from 'html-formatter';
import { format, IMentionTarget } from '@platform/markdown';


let source: string; let target: string; let mentions: IMentionTarget[] = [];

describe('@platform/markdown', () => {
  test('does not break on empty input', () => {
    expect(format(null)).toEqual('');
    expect(format(undefined)).toEqual('');
  });

  test('does not render heading', () => {
    source = '# Heading 1';
    target = '<h1>Heading 1</h1>';
    expect(format(source)).not.toEqual(target);
    expect(format(source)).toEqual(source);
  });

  test('renders links correctly', () => {
    source = 'Following is a link https://google.com.';
    target = '<p>Following is a link <a href="https://google.com" target="_blank">https://google.com</a>.</p>';
    expect(format(source)).toEqual(target);
  });

  test('renders mixed list correctly', () => {
    source = `
1. First item

- Unordered list mixed between
- Another unordered item

2. Second item
3. Third item
`;
    target = `
<ol>
<li>First item</li>
</ol>
<ul>
<li>Unordered list mixed between</li>
<li>Another unordered item</li>
</ul>
<ol start="2">
<li>Second item</li>
<li>Third item</li>
</ol>
`;
    expect(formatter.render(format(source))).toEqual(formatter.render(target));
  });

  test('renders literal tag using HTML entities', () => {
    source = '<script type="text/javascript">alert("Hello, World")</script>';
    target = '<p>&lt;script type=&quot;text/javascript&quot;&gt;alert(&quot;Hello, World&quot;)&lt;/script&gt;</p>';
    expect(format(source, { mentions })).toEqual(target);

    source = '<iframe src="https://google.com"></iframe>';
    target = '<p>&lt;iframe src=&quot;<a href="https://google.com" target="_blank">https://google.com</a>&quot;&gt;&lt;/iframe&gt;</p>';
    expect(format(source, { mentions })).toEqual(target);
  });

  test('recognizes links without http/https', () => {
    source = 'Checkout google google.com';
    target = '<p>Checkout google <a href="http://google.com" target="_blank">google.com</a></p>';
    expect(format(source)).toEqual(target);
  });

  test('does not add newlines', () => {
    source = `First line
Second line`;
    target = `<p>First line
Second line</p>`;
    expect(format(source).indexOf('<br/>')).toEqual(-1);
    expect(format(source)).toEqual(target);
  });

  test('renders im-balanced code block correctly', () => {
    // source = '```code'
    // target = '<pre><code></code></pre>'
    // expect(format(source)).toEqual(target)

    source = '`code';
    target = '<p>`code</p>';
    expect(format(source)).toEqual(target);
  });

  test('renders basic mentions correctly', () => {
    source = 'Hi {{1}}, How you doing?';
    target = '<p>Hi <a href="/profile/1" target="_blank" rel="noreferrer" class="mention mention--1">Tung Dao</a>, How you doing?</p>';
    const mentions = [{
      id: 1,
      target: {
        id: 1,
        name: 'Tung Dao',
        is_active: true,
        is_removed: false,
        is_approved: true,
      },
    }];
    expect(format(source, { mentions })).toEqual(target);
  });

  test('render @channel mentions correctly', () => {
    source = 'Hi {{channel}} How you doing?';
    target = '<p>Hi <span class="channel-mention">@channel</span> How you doing?</p>';
    const mentions = [{
      id: 1,
      target: {
        id: 1,
      },
    }];

    expect(format(source, { mentions })).toEqual(target);
  });

  test('render @here mentions correctly', () => {
    source = '{{here}} How you doing?';
    target = '<p><span class="channel-mention">@here</span> How you doing?</p>';
    const mentions = [{
      id: 1,
      target: {
        id: 1,
      },
    }];

    expect(format(source, { mentions })).toEqual(target);
  });

  test('render removed user mentions correctly', () => {
    source = 'Hi, {{1}} How you doing?';
    target = '<p>Hi, Tung Dao How you doing?</p>';
    const mentions = [{
      id: 1,
      target: {
        id: 1,
        name: 'Tung Dao',
        is_active: false,
      },
    }];

    expect(format(source, { mentions })).toEqual(target);
  });

  test('does not render non-existing mentions (API error case)', () => {
    source = 'Hi, {{1}} How you doing?';
    target = '<p>Hi, {{1}} How you doing?</p>';
    const mentions = [{
      id: 1,
      target: {
        id: 2,
        name: 'Tung Dao',
        is_active: false,
      },
    }];

    expect(format(source, { mentions })).toEqual(target);
  });

  test('uses full_name if name is missing', () => {
    source = 'Hi {{1}}, How you doing?';
    target = '<p>Hi <a href="/profile/1" target="_blank" rel="noreferrer" class="mention mention--1">Tung Dao</a>, How you doing?</p>';
    let mentions = [{
      id: 1,
      target: {
        id: 1,
        full_name: 'Tung Dao',
        is_active: true,
        is_removed: false,
        is_approved: true,
      },
    }];

    expect(format(source, { mentions })).toEqual(target);

    source = 'Hi, {{1}} How you doing?';
    target = '<p>Hi, Tung Dao How you doing?</p>';
    mentions = [{
      id: 1,
      target: {
        id: 1,
        full_name: 'Tung Dao',
        is_active: false,
        is_removed: true,
        is_approved: true
      },
    }];

    expect(format(source, { mentions })).toEqual(target);
  });
})
