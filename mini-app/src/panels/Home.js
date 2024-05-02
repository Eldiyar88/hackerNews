import { useState, useEffect } from 'react';
import axios from 'axios';
import { Panel, PanelHeader, Group, Div, List, Cell,  Button } from '@vkontakte/vkui';
import PropTypes from 'prop-types';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
// import { DEFAULT_VIEW_PANELS } from '../routes';


export const Home = ({ id }) => {
  // const { goToPanel } = useActiveVkuiLocation();
  const routeNavigator = useRouteNavigator();
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // console.log('---------->>>', routeNavigator);

  // Функция для загрузки новостей
  const fetchNews = async () => {
    setIsLoading(true);
    try {
      // Загружаем новости с сервера
      const response = await axios.get('https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty');
      console.log('------------->>>>', response);
      const newsIds = response.data.slice(-100);

      // Загружаем данные каждой новости
      const fetchedNews = await Promise.all(newsIds.map(id =>
        axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`).then(res => res.data)
      ));

      // Сортируем новости по дате публикации в порядке убывания
      fetchedNews.sort((a, b) => b.time - a.time);

      // Обновляем список новостей
      setNews(fetchedNews);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    }
    setIsLoading(false);
  };

  // Функция для обработки события прокрутки
  const handleScroll = () => {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollHeight - scrollTop === clientHeight && !isLoading) {
      // Пользователь достиг конца страницы, загружаем следующую партию новостей
      fetchNews();
    }
  };

  // Загрузка первой партии новостей при монтировании компонента
  useEffect(() => {
    fetchNews();
        // Устанавливаем интервал для автоматического обновления новостей раз в минуту
        const interval = setInterval(fetchNews, 60000);

        // Очистка интервала при размонтировании компонента
        return () => clearInterval(interval);
  }, 
  []);

  // Добавляем обработчик события прокрутки при монтировании компонента
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

//   // При нажатии на новость
// const handleNewsItemClick = (newsId) => {
//   goToPanel(DEFAULT_VIEW_PANELS.NEWSITEM, { id: newsId }); 
//   // Переход на страницу новости с передачей id в параметрах URL
// };

// При нажатии на новость
const handleNewsItemClick = (newsId) => {
  routeNavigator.push(`/newsItem/${newsId}`); // Навигация на страницу новости с передачей id в параметрах маршрута
};

  return (
    <Panel id={id}>
      <PanelHeader>Главная</PanelHeader>
      <Group header="Hacker news">
      <Div>
          {/* Кнопка для принудительного обновления списка новостей */}
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
