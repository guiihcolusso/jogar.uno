import { styles } from './footer.styles'

export const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.container()}>
      <div className={styles.inner()}>
        <span className={styles.brandName()}>UNO</span>
        <span className={styles.copyright()}>Real-time multiplayer • {year}</span>
      </div>
    </footer>
  )
}
