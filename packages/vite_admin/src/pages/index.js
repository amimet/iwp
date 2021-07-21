import Main from './main'
import Account from './account'
import Login from './login'

import Accounts from './users'
import Workload from './users/workload'

import Roles from './users/roles'
import Vault from './vault'

//* ROUTES
export default {
    "main": Main,
    "account": Account,
    "login": Login,
    "accounts": Accounts,
    "users/workload": Workload,
    "users/roles": Roles,
    "vault": Vault,
}