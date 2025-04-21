'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginPage() {
	const API_URL = 'https://crmm.repid.uz/api/v1'
	const AUTH_URL = `${API_URL}/login/access_token`
	const CURRENT_USER_URL = `${API_URL}/login/get-current-user`
	const CHANGE_PASSWORD_URL = `${API_URL}/login/change-password`

	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [otpCode, setOtpCode] = useState('')
	const [passwordVisible, setPasswordVisible] = useState(false)
	const [newPasswordVisible, setNewPasswordVisible] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [alertMessage, setAlertMessage] = useState('')
	const [alertType, setAlertType] = useState('')
	const [showChangePassword, setShowChangePassword] = useState(false)
	const [userData, setUserData] = useState(null)
	const router = useRouter()

	// Check if user is already logged in
	useEffect(() => {
		const token = localStorage.getItem('access_token')
		if (token) {
			fetchCurrentUser(token)
		}
	}, [])

	const fetchCurrentUser = async token => {
		try {
			const response = await fetch(CURRENT_USER_URL, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!response.ok) {
				localStorage.removeItem('access_token')
				return
			}

			const data = await response.json()
			setUserData(data)
		} catch (err) {
			console.error('Failed to fetch user data:', err)
		}
	}

	const handleLogin = async e => {
		e.preventDefault()
		setLoading(true)
		setError('')
		setAlertMessage('')

		if (password.length < 6) {
			setAlertMessage("Parol kamida 6 belgidan iborat bo'lishi kerak!")
			setAlertType('error')
			setLoading(false)
			return
		}

		try {
			if (!username.trim() || !password.trim()) {
				throw new Error("Iltimos, barcha maydonlarni to'ldiring")
			}

			const response = await fetch(AUTH_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					username,
					password,
				}),
			})

			const contentType = response.headers.get('content-type')
			if (!contentType || !contentType.includes('application/json')) {
				const text = await response.text()
				throw new Error(text || `HTTP error! status: ${response.status}`)
			}

			const data = await response.json()

			if (!response.ok) {
				// Handle different error cases with specific messages
				if (response.status === 401) {
					throw new Error("Foydalanuvchi mavjud emas yoki parol noto'g'ri")
				} else if (response.status === 404) {
					throw new Error('Foydalanuvchi topilmadi')
				}

				const errorMessage =
					data.detail || data.message || 'Kirishda xatolik yuz berdi'
				throw new Error(errorMessage)
			}

			if (!data.access_token) {
				throw new Error('Kirish tasdiqlanmadi')
			}

			localStorage.setItem('access_token', data.access_token)
			setAlertMessage('Kirish muvaffaqiyatli amalga oshirildi!')
			setAlertType('success')

			// Fetch user data after successful login
			const userResponse = await fetch(CURRENT_USER_URL, {
				headers: {
					Authorization: `Bearer ${data.access_token}`,
				},
			})

			if (userResponse.ok) {
				const userData = await userResponse.json()
				setUserData(userData)
			}

			setTimeout(() => {
				router.push('/dashboard')
			}, 2000)
		} catch (err) {
			// User-friendly error messages
			let errorMessage = err.message

			if (err.message.includes('Failed to fetch')) {
				errorMessage = 'Tarmoq xatosi - iltimos, internet aloqasini tekshiring'
			}

			setError(errorMessage)
			setAlertMessage(errorMessage)
			setAlertType('error')
		} finally {
			setLoading(false)
		}
	}

	const handleChangePassword = async e => {
		e.preventDefault()
		setLoading(true)
		setError('')
		setAlertMessage('')

		try {
			if (!otpCode || !newPassword) {
				throw new Error("Iltimos, barcha maydonlarni to'ldiring")
			}

			if (newPassword.length < 6) {
				throw new Error("Yangi parol kamida 6 belgidan iborat bo'lishi kerak")
			}

			const token = localStorage.getItem('access_token')
			if (!token) {
				throw new Error('Siz avval tizimga kirishingiz kerak')
			}

			const response = await fetch(
				`${CHANGE_PASSWORD_URL}?otp_code=${otpCode}&your_new_password=${newPassword}`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			)

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(
					errorData.detail || "Parolni o'zgartirishda xatolik yuz berdi"
				)
			}

			setAlertMessage("Parol muvaffaqiyatli o'zgartirildi!")
			setAlertType('success')
			setShowChangePassword(false)
			setNewPassword('')
			setOtpCode('')
		} catch (err) {
			setError(err.message)
			setAlertMessage(err.message)
			setAlertType('error')
		} finally {
			setLoading(false)
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
				{userData ? (
					<div className='text-center'>
						<h2 className='text-2xl font-bold text-[#002B48] mb-4'>
							Xush kelibsiz, {userData.first_name}!
						</h2>
						<p className='mb-6'>Siz allaqachon tizimga kirgansiz</p>
						<button
							onClick={() => router.push('/dashboard')}
							className='bg-[#F48C06] text-white px-6 py-2 rounded-lg'
						>
							Boshqaruv paneliga o'tish
						</button>
						<button
							onClick={() => setShowChangePassword(true)}
							className='ml-4 text-[#F48C06] border border-[#F48C06] px-6 py-2 rounded-lg'
						>
							Parolni o'zgartirish
						</button>
					</div>
				) : showChangePassword ? (
					<div className='w-full max-w-md'>
						<h2 className='text-2xl font-bold text-[#002B48] mb-6 text-center'>
							Parolni o'zgartirish
						</h2>
						<form onSubmit={handleChangePassword}>
							<div className='space-y-4'>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										OTP Kod
									</label>
									<input
										type='text'
										value={otpCode}
										onChange={e => setOtpCode(e.target.value)}
										className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F48C06]'
										required
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Yangi Parol
									</label>
									<div className='relative'>
										<input
											type={newPasswordVisible ? 'text' : 'password'}
											value={newPassword}
											onChange={e => setNewPassword(e.target.value)}
											className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F48C06]'
											required
										/>
										<button
											type='button'
											className='absolute right-3 top-2.5'
											onClick={() => setNewPasswordVisible(!newPasswordVisible)}
										>
											<span className='text-[#002B48] text-[22px] sm:text-[24px]'>
												{newPasswordVisible ? (
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
								<button
									type='submit'
									disabled={loading}
									className='w-full bg-[#F48C06] text-white py-2 rounded-lg disabled:opacity-70 flex justify-center items-center'
								>
									{loading ? (
										<>
											<svg
												className='animate-spin -ml-1 mr-2 h-5 w-5 text-white'
												xmlns='http://www.w3.org/2000/svg'
												fill='none'
												viewBox='0 0 24 24'
											>
												<circle
													className='opacity-25'
													cx='12'
													cy='12'
													r='10'
													stroke='currentColor'
													strokeWidth='4'
												></circle>
												<path
													className='opacity-75'
													fill='currentColor'
													d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
												></path>
											</svg>
											Amalga oshirilmoqda...
										</>
									) : (
										"Parolni o'zgartirish"
									)}
								</button>
								<button
									type='button'
									onClick={() => setShowChangePassword(false)}
									className='w-full text-[#F48C06] py-2 rounded-lg border border-[#F48C06]'
								>
									Orqaga
								</button>
							</div>
						</form>
					</div>
				) : (
					<>
						<p className='text-3xl font-medium text-[#002B48] mb-5 sm:mb-7'>
							Kirish
						</p>
						<form onSubmit={handleLogin} noValidate>
							<div className='flex flex-col gap-y-4 sm:gap-y-6 items-end'>
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
											className={`w-[320px] sm:w-[435px] outline-none ring-1 ${
												error ? 'ring-red-500' : 'ring-[#002B48]'
											} px-[20px] sm:px-[30px] py-[11px] sm:py-[15px] rounded-[20px]`}
											type='text'
											id='login'
											placeholder='Foydalanuvchi nomi'
											autoComplete='off'
											value={username}
											onChange={e => setUsername(e.target.value)}
											disabled={loading}
										/>
									</div>
								</div>

								<div className='flex flex-col items-start gap-y-2'>
									<label
										className='text-[#002B48] text-sm sm:text-base'
										htmlFor='password'
									>
										Parol
									</label>
									<div className='relative'>
										<input
											className={`w-[320px] sm:w-[435px] outline-none ring-1 ${
												error ? 'ring-red-500' : 'ring-[#002B48]'
											} pl-[20px] sm:pl-[30px] pr-[50px] py-[11px] sm:py-[15px] rounded-[20px]`}
											type={passwordVisible ? 'text' : 'password'}
											id='password'
											placeholder='Parolni kiriting'
											value={password}
											onChange={e => setPassword(e.target.value)}
											disabled={loading}
										/>
										<button
											type='button'
											className='absolute top-3 sm:top-3.5 right-4'
											onClick={() => setPasswordVisible(!passwordVisible)}
											disabled={loading}
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

								<button
									type='submit'
									disabled={loading}
									className={`${
										loading
											? 'bg-[#F48C06]/80 cursor-not-allowed'
											: 'bg-[#F48C06] hover:bg-[#F48C50]/80 cursor-pointer'
									} text-white mt-7 flex items-center justify-center duration-200 h-[45px] sm:h-[50px] w-[170px] sm:w-[200px] font-medium rounded-[36px] text-base sm:text-lg`}
								>
									{loading ? (
										<>
											<svg
												className='animate-spin -ml-1 mr-2 h-5 w-5 text-white'
												xmlns='http://www.w3.org/2000/svg'
												fill='none'
												viewBox='0 0 24 24'
											>
												<circle
													className='opacity-25'
													cx='12'
													cy='12'
													r='10'
													stroke='currentColor'
													strokeWidth='4'
												></circle>
												<path
													className='opacity-75'
													fill='currentColor'
													d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
												></path>
											</svg>
											Kirilmoqda...
										</>
									) : (
										'Kirish'
									)}
								</button>
							</div>
						</form>
					</>
				)}

				{/* Beautiful Alert Message */}
				{alertMessage && (
					<div
						className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg text-white z-50 animate-fade-in-up ${
							alertType === 'error' ? 'bg-red-500' : 'bg-green-500'
						}`}
						style={{
							animation: 'fadeInUp 0.3s ease-out',
							boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
						}}
					>
						<div className='flex items-center gap-3'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width='24'
								height='24'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
								className='flex-shrink-0'
							>
								{alertType === 'error' ? (
									<>
										<circle cx='12' cy='12' r='10'></circle>
										<line x1='12' y1='8' x2='12' y2='12'></line>
										<line x1='12' y1='16' x2='12.01' y2='16'></line>
									</>
								) : (
									<>
										<path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'></path>
										<polyline points='22 4 12 14.01 9 11.01'></polyline>
									</>
								)}
							</svg>
							<div>
								<p className='font-medium text-sm'>{alertMessage}</p>
							</div>
						</div>
					</div>
				)}
			</div>
			
		</div>
	)
}
