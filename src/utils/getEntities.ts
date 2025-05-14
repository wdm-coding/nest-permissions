import { Logs } from 'src/entities/logs/logs.entity'
import { Users } from '../entities/users/users.entity'
import { Menus } from 'src/entities/menus/menus.entity'
import { Roles } from 'src/entities/roles/roles.entity'
const getEntities = (path: string) => {
  const map = {
    '/user': Users,
    '/logs': Logs,
    '/menus': Menus,
    '/roles': Roles,
    '/auth': 'Auth'
  }
  const target = Object.keys(map).find(item => path.includes(item))
  return target ? map[target] : null
}

export default getEntities
