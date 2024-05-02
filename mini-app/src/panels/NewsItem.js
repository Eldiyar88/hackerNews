import { useState, useEffect } from 'react';
import axios from 'axios';
import { Panel, PanelHeader, PanelHeaderBack, Placeholder, Header, Div, Link, Text, Separator, Button, Group, Cell, Avatar, List, Spinner } from '@vkontakte/vkui';
import PropTypes from 'prop-types';
import { useRouteNavigator, useParams} from '@vkontakte/vk-mini-apps-router';

export const NewsItem = () => {
  const { id } = useParams();
  const routeNavigator = useRouteNavigator();
  const [news, setNews] = useState(null);
  const [comments, setComments] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`); 
        console.log('--------->', response.data);
        const fetchedNews = response.data;
        setNews(fetchedNews);
      } catch (error) {
        console.error('Failed to fetch news item:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  const fetchComments = async (commentIds) => {
    if (commentIds) {
      const commentsPromises = commentIds.map(commentId =>
        axios.get(`https://hacker-news.firebaseio.com/v0/item/${commentId}.json?print=pretty`)
      );
      try {
        const commentsResponses = await Promise.all(commentsPromises);
        setComments(commentsResponses.map(res => res.data));
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      }
    }
  };
  
  const handleBackClick = () => {
    routeNavigator.back();
  };

  return (
    <Panel >
      <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
        Новости
      </PanelHeader>
      <Group header="Hacker news">
      {isLoading && <Spinner size="large" />}
      {news && (
        <>
          <Placeholder>
            <Header>{news.title}</Header>
            <Div>
              <Link href={news.url} target="_blank" rel="noopener noreferrer">{news.url}</Link>
              <Text weight="regular">{new Date(news.time * 1000).toLocaleString()}</Text>
              <Separator style={{ margin: '12px 0' }} />
              <Group>
                <Cell >Автор: {news.by}</Cell>
                <Cell>{comments.length} комментариев</Cell>
              </Group>
              {news.kids && (
                <>
                  <Separator style={{ margin: '12px 0' }} />
                  <List> Список комментариев: 
                    {comments.map((commentId, index) => (
                      <Cell key={index}>{comments.by} {comments.text}</Cell>
                    ))}
                  </List>
                </>
              )}
            </Div>
          </Placeholder>
          <Div style={{ padding: '8px' }}>
            <Button size="l" mode="secondary" stretched onClick={handleBackClick}>Назад</Button>
          </Div>
        </>
      )}
      </Group>
    </Panel>
  );
};

NewsItem.propTypes = {
  id: PropTypes.string.isRequired,
};
