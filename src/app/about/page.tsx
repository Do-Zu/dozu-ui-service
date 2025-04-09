import Link from 'next/link';
export default function About() {
  return (
  <>
  <h1>About me</h1>

  <Link href="/about/profile">
        <button style={{ margin: '10px', color: 'red' }}>Profile</button>
  </Link>
  </>
  )
}
