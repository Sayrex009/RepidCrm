'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [passwordVisible, setPasswordVisible] = useState(false)
	const router = useRouter()

	const handleLogin = async e => {
		e.preventDefault()

		const res = await fetch('https://crmm.repid.uz/api/v1/login/access_token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				username,
				password,
			}),
		})

		const data = await res.json()
		console.log(data)

		if (res.ok) {
			router.push('/dashboard')
		}
	}

	return (
		<div className='flex min-h-screen'>
			{/* Left Side */}
			<div className='hidden lg:block relative w-[850px] h-[880px] lg:ml-[40px] lg:mt-[34px]'>
				<Image
					src='/assets/icons/Login-bg.svg'
					alt='Login background'
					layout='fill'
					objectFit='cover'
					quality={100}
					className='rounded-[29px]'
				/>
			</div>

			{/* Right Side */}
			<div className='w-full lg:w-[52%] flex flex-col items-center md:justify-center pt-[200px] md:pt-0'>
				<p className='text-3xl font-medium text-[#002B48] mb-5 sm:mb-7'>
					Kirish
				</p>
				<form onSubmit={handleLogin} noValidate>
					<div className='flex flex-col gap-y-4 sm:gap-y-6 items-end'>
						{/* Login field */}
						<div className='flex flex-col items-start gap-y-2'>
							<label
								className='text-[#002B48] text-sm sm:text-base'
								htmlFor='login'
							>
								Login
							</label>
							<div className='relative'>
								<input
									autoCapitalize='none'
									className='w-[320px] sm:w-[435px] outline-none ring-1 ring-[#002B48] px-[20px] sm:px-[30px] py-[11px] sm:py-[15px] rounded-[20px]'
									type='text'
									id='login'
									placeholder='Foydalanuvchi nomi'
									autoComplete='off'
									value={username}
									onChange={e => setUsername(e.target.value)}
								/>
							</div>
						</div>

						{/* Password field */}
						<div className='flex flex-col items-start gap-y-2'>
							<label
								className='text-[#002B48] text-sm sm:text-base'
								htmlFor='password'
							>
								Parol
							</label>
							<div className='relative'>
								<input
									className='w-[320px] sm:w-[435px] outline-none ring-1 ring-[#002B48] pl-[20px] sm:pl-[30px] pr-[50px] py-[11px] sm:py-[15px] rounded-[20px]'
									type={passwordVisible ? 'text' : 'password'}
									id='password'
									placeholder='Parolni kiriting'
									value={password}
									onChange={e => setPassword(e.target.value)}
								/>
								<button
									type='button'
									className='absolute top-3 sm:top-3.5 right-4'
									onClick={() => setPasswordVisible(!passwordVisible)}
								>
									<span className='text-[#002B48] text-[22px] sm:text-[24px]'>
										{passwordVisible ? (
											<svg
												viewBox='64 64 896 896'
												width='1em'
												height='1em'
												fill='currentColor'
											>
												<path d='M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 000 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM512 766c-161.3 0-279.4-81.8-362.7-254C232.6 339.8 350.7 258 512 258c161.3 0 279.4 81.8 362.7 254C791.5 684.2 673.4 766 512 766zm-4-430c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm0 288c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z'></path>
											</svg>
										) : (
											<svg
												viewBox='64 64 896 896'
												width='1em'
												height='1em'
												fill='currentColor'
											>
												<path d='M396 512a112 112 0 10224 0 112 112 0 10-224 0zm546.2-25.8C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 000 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM508 688c-97.2 0-176-78.8-176-176s78.8-176 176-176 176 78.8 176 176-78.8 176-176 176z'></path>
											</svg>
										)}
									</span>
								</button>
							</div>
						</div>

						{/* Submit button */}
						<button
							type='submit'
							className='cursor-pointer bg-[#F48C06] hover:bg-[#F48C50]/80 text-[#fff] mt-7 flex items-center justify-center duration-200 h-[45px] sm:h-[50px] w-[170px] sm:w-[200px] font-medium rounded-[36px] text-base sm:text-lg'
						>
							<span>Kirish</span>
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
