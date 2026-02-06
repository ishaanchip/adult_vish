import React, {useState, useEffect} from 'react'
import "./Connections.css"

//images & icons
import { FaHeart } from "react-icons/fa";
import { FaCarrot } from "react-icons/fa6";



//intercomponent imports
import {randomizeConnectionSet, retrieveUnsortedConnection, removeLife, sortCorrectGuess, superSecretPassword } from './helper'


//external dependenices
import { useQuery } from '@tanstack/react-query'
import { ProgressCircle, Icon,
    Button,
    CloseButton,
    Dialog,
    For,
    HStack,
    Portal, } from '@chakra-ui/react';
import {motion} from "framer-motion"
import { delay } from './helper';

const Connections = ({setUserNavSelection}) => {
  //0. SETTING UP VARIABLES
  const MotionIcon = motion(Icon)  

  //0. BASE VARIABLES
    //all the 16 pieces housed here [each should be given certain statuses along w phrase (-1: unselected, 0:selected, [1,2,3,4]:solved w corresponding color)]

    /*
    TEMPLATE
    const [currentBibleTranslationId, setCurrentBibleTranslationId] = useState(() =>{
        return localStorage.getItem('last_bible_translation') || "BSB"
      })
    */


    const [connectionLockStatus, setConnectionLockStatus] = useState(() =>{
        const saved = localStorage.getItem('vish_connection_lock_status')
        return saved ? JSON.parse(saved) : "locked"
    })  
    const [connectionLockGuess, setConnectionLockGuess] = useState("")
    const [connectionPieces, setConnectionPieces] = useState(() =>{
        const saved = localStorage.getItem("vish_connection_pieces")
        return saved ? JSON.parse(saved) : []

    })
    const [currentGuess, setCurrentGuess] = useState(() =>{
        const saved = localStorage.getItem("vish_current_guess")
        return saved ? JSON.parse(saved) : []
    })
    const [currentLives, setCurrentLives] = useState(() =>{
        const saved = localStorage.getItem("vish_current_lives")
        return saved ? JSON.parse(saved) : [1, 1, 1, 1]
    })
    const [currentLiveCounter, setCurrentLiveCounter] = useState(() =>{
        return parseInt(localStorage.getItem('vish_current_live_counter')) || 4
    })
    const [foundCategories, setFoundCategories] = useState(() =>{
        const saved = localStorage.getItem("vish_found_categories")
        return saved ? JSON.parse(saved) : []
    })
    const [attempts, setAttempts] =  useState(() =>{
        return parseInt(localStorage.getItem('vish_connection_attempts')) || 1
    })

    const [globalUnsortedConnection, setGlobalUnsortedConnection] = useState(() =>{
        const saved = localStorage.getItem('vish_unsorted_connection')
        return saved ? JSON.parse(saved) : []
    })

    const [inBetweenCorrectGuess, setInBetweenCorrectGuess] = useState(false)

    
  //1. BASE ROUTING [retrieving connection set & putting in filtered form]
    //1a. fetch init passage for display
    const {data: unsortedConnection, isFetched: connectionFetched} = useQuery({
        queryKey:['retrieve-tdy-connection'],
        queryFn:async() => retrieveUnsortedConnection(),
        staleTime:0
    })
    useEffect(() =>{
        if (unsortedConnection && connectionPieces.length === 0 && foundCategories.length !== 4){
          setGlobalUnsortedConnection(unsortedConnection)
          localStorage.setItem('vish_unsorted_connection', JSON.stringify(unsortedConnection))
          let roundSet =  randomizeConnectionSet(unsortedConnection)
          setConnectionPieces(roundSet)
          localStorage.setItem('vish_connection_pieces', JSON.stringify(roundSet))
        }
      }, [unsortedConnection])

  //2. CLICKING [process of filling up current guess, emptying out, etc....]
      const handleConnectionClick = (piece) =>{
        if (!(piece.status == 0 || piece.status == -1) || currentLives.every((life) => life === 0)){
            return
        }
        //a. if content of piece included in current guess, set status to -1 [off], remove from array
        else if (currentGuess.find(p => p.content.phrase == piece.content.phrase) != undefined){
                let newCurrentGuess = currentGuess.filter((guess) => guess.content.phrase !== piece.content.phrase)
                setCurrentGuess(newCurrentGuess)
                localStorage.setItem('vish_current_guess', JSON.stringify(newCurrentGuess))
                let newConnectionPieces = connectionPieces.map((p) =>{
                    if (p.content.phrase == piece.content.phrase){
                        return {
                            ...p,
                            status:-1,
                        }
                    }
                    return p
                })
                setConnectionPieces(newConnectionPieces)
                localStorage.setItem("vish_connection_pieces", JSON.stringify(newConnectionPieces))
        }
        //c. if content of piece not alr included in current guess, set status to 0 [on], append to array
        else{
            //c-i. first case, connection guesses cannot alr be filled
            if (currentGuess.length < 4){
                let newCurrentGuess = [...currentGuess, {
                    ...piece,
                    status:0,
                }]
                setCurrentGuess(newCurrentGuess)
                localStorage.setItem('vish_current_guess', JSON.stringify(newCurrentGuess))
                let newConnectionPieces = connectionPieces.map((p) =>{
                    if (p.content.phrase == piece.content.phrase){
                        return {
                            ...p,
                            status:0,
                        }
                    }
                    return p
                })
                setConnectionPieces(newConnectionPieces)
                localStorage.setItem("vish_connection_pieces", JSON.stringify(newConnectionPieces))
            }
        }

      }

   //3. SUBMITTING [process of verfying current guesses, editing lives, clearing states, etc...]
      const handleConnectionGuess = async () =>{
        if (currentGuess.length == 4){
            //a. check if answer is even right
            if (currentGuess.every(guess => guess.content.group == currentGuess[0].content.group)){
                //variable to true will hide submit/replay button
                setInBetweenCorrectGuess(true)

                //increment category found index [disjointed from setFoundCategories due to refernce order, but they connected]
                let currentCategoryFound = foundCategories.length + 1

                //edit status of selected pieces
                let newConnectionPieces = connectionPieces.map((p) =>{
                    if (currentGuess.find(guess => guess.content.phrase == p.content.phrase)){
                        return {
                            ...p,
                            status:currentCategoryFound,
                        }
                    }
                    return p
                })
                // setConnectionPieces(newConnectionPieces)

                //sort pieces accordingly
                let sortedConnectionPieces = sortCorrectGuess(newConnectionPieces, currentGuess[0].content.group)
                setConnectionPieces(sortedConnectionPieces)
                await delay(2200)

                //remove four found pieces from set
                let categoryContent = sortedConnectionPieces.slice(0, 4)
                let newSortedConnectionPieces = sortedConnectionPieces.slice(4)
                setConnectionPieces(newSortedConnectionPieces)
                localStorage.setItem("vish_connection_pieces", JSON.stringify(newSortedConnectionPieces))

                //add category to what found
                let newFoundCategories  = [...foundCategories]
                newFoundCategories.push({
                    group: currentGuess[0].content.group,
                    found_index: currentCategoryFound,
                    category_content:categoryContent
                
                })
                setFoundCategories(newFoundCategories)
                localStorage.setItem('vish_found_categories', JSON.stringify(newFoundCategories))

                //variable to false will reveal submit/replay button
                setInBetweenCorrectGuess(false)






            }
            else{
                //edit lives
                let newLiveCounter = currentLiveCounter - 1
                setCurrentLiveCounter(newLiveCounter)
                localStorage.setItem("vish_current_live_counter", newLiveCounter)
                let newLiveArray = removeLife(currentLives)
                setCurrentLives(newLiveArray)
                localStorage.setItem("vish_current_lives", JSON.stringify(newLiveArray))

                //edit status of selected pieces
                let newConnectionPieces = connectionPieces.map((p) =>{
                    if (currentGuess.find(guess => guess.content.phrase == p.content.phrase)){
                        return {
                            ...p,
                            status:-1,
                        }
                    }
                    return p
                })
                setConnectionPieces(newConnectionPieces)
                localStorage.setItem("vish_connection_pieces", JSON.stringify(newConnectionPieces))
            }
        }
        //reset current guesses
        setCurrentGuess([])
        localStorage.setItem('vish_current_guess', JSON.stringify([]))
      }

    //4. REPLAYING CONNECTION
      const handleReplayConnection = () =>{
        //a. update connection attempts
        let newAttemptValue = attempts + 1
        setAttempts(newAttemptValue)
        localStorage.setItem('vish_connection_attempts', newAttemptValue)

        //b. reset live game
        setConnectionPieces(randomizeConnectionSet(globalUnsortedConnection))
        setCurrentGuess([])
        setCurrentLives([1,1,1,1])
        setCurrentLiveCounter(4)
        setFoundCategories([])
        setConnectionLockStatus("locked")

        //c. reset storage
        localStorage.setItem("vish_connection_pieces", JSON.stringify([]))
        localStorage.setItem('vish_current_guess', JSON.stringify([]))
        localStorage.setItem("vish_current_lives", JSON.stringify([1,1,1,1]))
        localStorage.setItem("vish_current_live_counter", 4)
        localStorage.setItem("vish_found_categories", JSON.stringify([]))
        localStorage.setItem('vish_connection_lock_status', JSON.stringify("locked"))


      }


      //4. password lock handle
      useEffect(() =>{
        if (connectionLockGuess === superSecretPassword){
            setConnectionLockStatus("unlocked")
            localStorage.setItem('vish_connection_lock_status', JSON.stringify("unlocked"))
            setConnectionLockGuess("")
        }
      }, [connectionLockGuess])


  return (
    <div className='connection-shell'>    
        <div className='connection-header'>
            <p>make 4 pairs of 4!</p>
        </div>
        <div className="game-stats">
                <div className="attempts">
                    <p>Attempt: {attempts}</p>
                </div>
                <div className="lives-counter">
                    <p>Guesses Remaining:</p>
                    {
                    currentLives.map((life, i) =>{
                        
                        if (life == 1){
                            return (
                                <MotionIcon
                                    key={i}
                                    as={FaCarrot}
                                    boxSize={5}
                                    marginTop={-4}
                                    color={"orange"}
                                    background="none"
                                    initial={{ scale: 1.1, opacity: 1 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        duration: 0.3,
                                        delay: i * 0.1,
                                        ease: "easeOut"
                                    }}
                                />
                            )
                        }
                        else{
                            return (
                                <Icon as={FaCarrot} boxSize={5}  marginTop={-4}  style={{color:'black', background:'none'}}/>
                            )      
                        }
                    })
                    }
                </div>
        </div>
        <div className='central-connection-display'>
            {
                connectionLockStatus === "locked" &&
                <div className='password-input-area'>
                    <h3>Enter Password (only I know it btw)</h3>
                    <p>welcome, avishi! in order to receive this amazing gift, you need to solve this connection...</p>
                    <p>however, you only get 1 attempt  per day. mwahahahha 😼</p>
                    <p>if you fail (which you probably will), your gift will have to WAIT</p>
                    <input placeholder='type in super secret password to play ...' onChange={(e) => setConnectionLockGuess(e.target.value)}/>
                </div>

            }
            <div className="connection-boxes">
            {
                connectionFetched === false 
                ?
                <div className='loading-container'>
                <ProgressCircle.Root value={null} size="xl">
                    <ProgressCircle.Circle>
                    <ProgressCircle.Track />
                    <ProgressCircle.Range stroke="orange"/>
                    </ProgressCircle.Circle>
                </ProgressCircle.Root>
                </div>
                :
                <>

                {
                    foundCategories.map((category) =>{
                    return (
                        <div className='category-display' style=
                            {category.found_index == 1 ? {'color':'black', 'background':'rgb(159, 194, 90)'} : category.found_index == 2 ? {'color':'black', 'background':'rgb(187, 129, 196)'} :
                            category.found_index == 3 ? {'color':'black', 'background':'rgb(250, 222, 109)'} : {'color':'black', 'background':'rgb(176, 196, 239)'} 
                            }>
                            <h1>{category.group}</h1>
                            <p>
                            {category.category_content[0].content.phrase}, {category.category_content[1].content.phrase}, {category.category_content[2].content.phrase}, {category.category_content[3].content.phrase}
                            </p>
                        </div>
                    )
                })
                }
                
                {connectionPieces.map((piece) =>{
                    return (
                        <motion.li 
                        key={piece.content.phrase}
                        layout="position"
                        transition={spring}
                        className='connection-box' 
                        onClick={
                            () => {
                                if (currentLiveCounter > 0)
                                    handleConnectionClick(piece)
                            }
                        } 
                        style=
                            {piece.status == -1 ? {'color':'black'}: piece.status == 0 ? {'color':'white', 'background':'rgb(90, 89, 78)'} :
                            piece.status == 1 ? {'color':'black', 'background':'rgb(159, 194, 90)'} : piece.status == 2 ? {'color':'black', 'background':'rgb(187, 129, 196)'} :
                            piece.status == 3 ? {'color':'black', 'background':'rgb(250, 222, 109)'} : {'color':'black', 'background':'rgb(176, 196, 239)'} 
                            }
                        >
                            <p>{piece.content.phrase}</p>
                        </motion.li>
                    )
                })
                }


                </>
            }
            </div>
            {/* <div className="connection-categories">
                <div className='connection-category-one connection-category'>
                    <p>CATEGORY #1: {foundCategories[0] !== undefined ? foundCategories[0] :"????"}</p>
                </div>
                <div className='connection-category-two connection-category'>
                    <p>CATEGORY #2: {foundCategories[1] !== undefined ? foundCategories[1] :"????"}</p>
                </div>
                <div className='connection-category-three connection-category'>
                    <p>CATEGORY #3: {foundCategories[2] !== undefined ? foundCategories[2] :"????"}</p>
                </div>
                <div className='connection-category-four connection-category'>
                    <p>CATEGORY #4: {foundCategories[3] !== undefined ? foundCategories[3] :"????"}</p>
                </div>
            </div> */}
        </div>
        <div className="connection-features">
            {
                inBetweenCorrectGuess === false &&
                (
                currentLives.every(life => life == 0) || foundCategories.length === 4 
                ?
                <button className="submit-connection-button" onClick={() => handleReplayConnection()}
                    style={{'color':'black', 'background':'rgb(238, 238, 229)'}}>
                    REPLAY
                </button>
                :
                <button className="submit-connection-button" onClick={() => {
                        if (currentGuess.length === 4){
                            handleConnectionGuess()
                        }
                    }
                }
                    style={currentGuess.length == 4 ? {'color':'white', 'background':'black'} : {'color':'gray','background':'whitesmoke', 'cursor':'text'}}>
                    SUBMIT
                </button>
                )
            }
        
        </div>
    </div>

  )
}


const spring = {
    type: "spring",
    damping: 5.5,
    stiffness: 10,
  }

export default Connections