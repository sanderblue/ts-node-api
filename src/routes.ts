import {UserController} from './controller/UserController';
import {SnowDepthController} from './controller/SnowDepthController';

export const Routes = [
  {
    method: 'get',
    route: '/users',
    controller: UserController,
    action: 'all'
  },
  {
    method: 'get',
    route: '/users/:id',
    controller: UserController,
    action: 'one'
  },
  {
    method: 'post',
    route: '/users',
    controller: UserController,
    action: 'save'
  },
  {
    method: 'delete',
    route: '/users',
    controller: UserController,
    action: 'remove'
  },
  {
    method: 'get',
    route: '/snow-depth/daily',
    controller: SnowDepthController,
    action: 'all'
  },
  {
    method: 'get',
    route: '/snow-depth/daily/:id',
    controller: SnowDepthController,
    action: 'one'
  },
  {
    method: 'get',
    route: '/snow-depth/daily/:location/:startDate/:endDate',
    controller: SnowDepthController,
    action: 'allByDateRange'
  },
  {
    method: 'post',
    route: '/snow-depth/daily',
    controller: SnowDepthController,
    action: 'save'
  },
  {
    method: 'delete',
    route: '/snow-depth/daily',
    controller: SnowDepthController,
    action: 'remove'
  },
  {
     method: 'get',
     route: '/snow-depth/download',
     controller: SnowDepthController,
     action: 'download'
  }
];
