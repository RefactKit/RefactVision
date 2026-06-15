import { auth } from './lib/auth'
console.log(
  Object.keys(auth.api).filter(
    (k) => k.toLowerCase().includes('member') || k.toLowerCase().includes('org'),
  ),
)
