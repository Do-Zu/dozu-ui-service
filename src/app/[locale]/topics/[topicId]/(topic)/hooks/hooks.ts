import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { TopicDispatch, TopicState } from '../store/store';

export const useTopicDispatch = useDispatch.withTypes<TopicDispatch>();
export const useTopicSelector = useSelector.withTypes<TopicState>();
