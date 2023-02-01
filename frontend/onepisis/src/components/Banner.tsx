import logo from '../assets/One_Piece_Logo.png'
import '../style/Banner.css'

function Banner() {
	const title = 'ISIS'
	return (
		<div className='lmj-banner'>
			<img src={logo} alt='La maisonjungle' className='lmj-logo' />
			<h1 className='lmj-title'>{title}</h1>
		</div>
	)
}

export default Banner