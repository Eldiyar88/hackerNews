import { useState, useEffect } from 'react';
import axios from 'axios';
import { Panel, PanelHeader, Group, Div, List, Cell,  Button } from '@vkontakte/vkui';
import PropTypes from 'prop-types';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';


export const Home = ({ id }) => {
  const routeNavigator = useRouteNavigator();
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty');
      console.log('------------->>>>', response);
      const newsIds = response.data.slice(-100);

      const fetchedNews = await Promise.all(newsIds.map(id =>
        axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`).then(res => res.data)
      ));

      fetchedNews.sort((a, b) => b.time - a.time);

      setNews(fetchedNews);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    }
    setIsLoading(false);
  };

  const handleScroll = () => {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollHeight - scrollTop === clientHeight && !isLoading) {
      fetchNews();
    }
  };

  useEffect(() => {
    fetchNews();
        const interval = setInterval(fetchNews, 60000);

        return () => clearInterval(interval);
  }, 
  []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


const handleNewsItemClick = (newsId) => {
  routeNavigator.push(`/newsItem/${newsId}`); 
};

  return (
    <Panel id={id}>
      <PanelHeader>Главная</PanelHeader>
      <Group header="Hacker news">
      <Div>
          <Button stretched size="l" mode="secondary" onClick={async () => {
            setIsLoading(true);
            try {
              await fetchNews();
            } catch (error) {
              console.error('Failed to fetch news:', error);
            }
            setIsLoading(false);
          }} 
          disabled={isLoading}>
            {isLoading ? 'Обновление...' : 'Обновить'}
          </Button>
        </Div>
        <List>
          {news.map((item, index) => (
            <Cell key={index}>
              <div onClick={() => handleNewsItemClick(item.id)}>{index + 1}.  {item.title}  Рейтинг: {item.score} Автор: {item.by}  Дата публикации: {new Date(item.time * 1000).toLocaleString()}</div>
            </Cell>
          ))}
          {isLoading && <Cell>Loading...</Cell>}
        </List>
      </Group>
    </Panel>
  );
};

Home.propTypes = {
  id: PropTypes.string.isRequired,
};
