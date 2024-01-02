/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext } from 'react'

import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { getAllOrder, searchOrder } from '~/apis/product.api'
import Loading from '~/components/Loading/Loading'

import Paginate from '~/components/Pagination/Paginate'

import usePagination from '~/hooks/usePagination'

import { UpdateOrdertHistory } from '~/apis/payment.api'
import { formatTime } from '~/utils/utils'
import { AppContext } from '~/contexts/app.context'
const Oders = () => {
  const { profile } = useContext(AppContext)

  const [staff, setStaff] = useState<any>([])
  const [search, setSearch] = useState<string>('')
  const { currentPage, totalPages, currentData, setCurrentPage } = usePagination(8, staff)
  const searchMutation = useMutation({
    mutationFn: (idUser: string) => searchOrder(idUser)
  })
  const updateMutations = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => UpdateOrdertHistory(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries('update-order-historys')
    }
  })

  const handleUpdate = (id: string, status: string) => {
    updateMutations.mutate({ id, status })
  }

  const queryClient = useQueryClient()
  useEffect(() => {
    if (search === '') {
      const intervalId = setInterval(() => {
        queryClient.invalidateQueries(['orders', 3])
      }, 3000)
      return () => clearInterval(intervalId)
    }
  }, [queryClient, search])

  const { isLoading: isLoadingUser } = useQuery({
    queryKey: ['orders', 3],
    queryFn: () => getAllOrder(),
    onSuccess: (data) => {
      setStaff(data.data.history)
    },
    cacheTime: 30000
  })
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }
  const handleSearch = (e: any) => {
    e.preventDefault()
    searchMutation.mutate(search, {
      onSuccess: (data) => {
        setStaff(data.data.history)
        setCurrentPage(1)
      },
      onError: () => {
        toast.warn('Lỗi!')
      }
    })
  }
  return (
    <>
      <div className='flex justify-between mb-3 mobile:flex-col tablet:flex-col'>
        <div className='mb-2 flex items-center'>
          <span className='my-4 font-bold dark:text-white'>Số lượng đơn hàng: {staff?.length}</span>
        </div>
        <div className='w-[50%] mobile:w-full'>
          <form onSubmit={(e) => handleSearch(e)}>
            <label htmlFor='default-search' className='mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white'>
              Search
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                <svg
                  className='w-4 h-4 text-gray-500 dark:text-gray-400'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 20 20'
                >
                  <path
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z'
                  />
                </svg>
              </div>
              <input
                type='search'
                id='default-search'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                placeholder='Tìm kiếm theo userId hoặc username...'
              />
              <button
                type='submit'
                className='text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
              >
                Tìm kiếm
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className='flex flex-col gap-[30px] flex-1'>
        {isLoadingUser ? (
          <Loading />
        ) : (
          <>
            <div className='relative flex-1 overflow-x-auto rounded-md shadow-md sm:rounded-lg'>
              <table className='w-full text-sm text-left text-gray-500 dark:text-gray-400'>
                <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
                  <tr>
                    <th scope='col' className='px-6 py-3'>
                      STT
                    </th>
                    <th scope='col' className='px-6 py-3'>
                      Mã phiên
                    </th>
                    <th scope='col' className='px-6 py-3'>
                      Mã hàng
                    </th>
                    <th scope='col' className='px-6 py-3'>
                      Username
                    </th>
                    <th scope='col' className='px-6 py-3'>
                      Id User
                    </th>
                    <th scope='col' className='px-6 py-3'>
                      Số tiền
                    </th>
                    <th scope='col' className='px-6 py-3'>
                      Trạng thái
                    </th>
                    <th scope='col' className='px-6 py-3'>
                      Thời gian cược
                    </th>
                    <th scope='col' className='px-6 py-3'>
                      Hành động
                    </th>
                  </tr>
                </thead>
                {staff.length !== 0 && (
                  <tbody>
                    {currentData.map((item: any, idx: number) => {
                      return (
                        <tr
                          key={item._id}
                          className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                        >
                          <th
                            scope='row'
                            className='w-[100px] px-6 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white'
                          >
                            {'#' + (idx + 1)}
                          </th>
                          <th
                            scope='row'
                            className='px-6 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white'
                          >
                            {item.codeOrder}
                          </th>
                          <th
                            scope='row'
                            className='px-6 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white'
                          >
                            {item.randomNumber}
                          </th>
                          <th
                            scope='row'
                            className='px-6 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white'
                          >
                            {item.username}
                          </th>
                          <th
                            scope='row'
                            className='px-6 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white'
                          >
                            {item.idUser}
                          </th>
                          <th
                            scope='row'
                            className='px-6 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white'
                          >
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                              minimumFractionDigits: 0
                            }).format(item.countNum as number)}
                          </th>
                          <th
                            scope='row'
                            className='px-6 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white'
                          >
                            <span
                              className={`${
                                item?.status === 'pending'
                                  ? 'bg-yellow-500'
                                  : item?.status === 'done'
                                  ? 'bg-green-500'
                                  : item?.status === 'lost'
                                  ? 'bg-red-500'
                                  : item?.status === 'false'
                                  ? 'bg-blue-500'
                                  : ''
                              } text-white px-2 py-0.5 pb-1 text-xs rounded-md`}
                            >
                              {item?.status}
                            </span>
                          </th>
                          <th
                            scope='row'
                            className='px-6 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white'
                          >
                            {formatTime(item?.createdAt)}
                          </th>
                          <th
                            scope='row'
                            className='px-6 py-3 w-[200px] grid grid-cols-2 gap-2 font-medium text-gray-900 whitespace-nowrap dark:text-white'
                          >
                            {item.status === 'pending' && (
                              <>
                                <button
                                  type='button'
                                  onClick={() => {
                                    handleUpdate(item._id, 'done')
                                  }}
                                  className='text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-2 py-1 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-900'
                                >
                                  Thắng
                                </button>
                                <button
                                  type='button'
                                  onClick={() => {
                                    handleUpdate(item._id, 'lost')
                                  }}
                                  className='text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-2 py-1 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900'
                                >
                                  Thua
                                </button>
                                <button
                                  type='button'
                                  onClick={() => {
                                    handleUpdate(item._id, 'false')
                                  }}
                                  className='text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-2 py-1 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900'
                                >
                                  Huỷ
                                </button>
                              </>
                            )}
                            {profile?.isAdmin && (
                              <button
                                type='button'
                                onClick={() => {
                                  handleUpdate(item._id, 'delete')
                                }}
                                className='text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-2 py-1 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-900'
                              >
                                Xoá
                              </button>
                            )}
                          </th>
                        </tr>
                      )
                    })}
                  </tbody>
                )}
              </table>
            </div>
            <Paginate totalPages={totalPages} currentPage={currentPage} handlePageChange={handlePageChange} />
          </>
        )}
      </div>
    </>
  )
}

export default Oders
