import {
    Card,
    CardMedia,
    CardContent,
    Box,
    Typography,
    Rating,
} from '@mui/material';
import { Link } from 'react-router-dom';
import FavoriteFab from './FavoriteFab';
import type { IItem } from '../api/useGetItems';
import { useState } from 'react';

interface Props {
    cardData: IItem;
}

const CardItem = ({ cardData }: Props) => {
    const [showFab, setShowFab] = useState<boolean>(false);

    return (
        <Box
            position={'relative'}
            height={275}
            onMouseOver={() => setShowFab(true)}
            onMouseOut={() => setShowFab(false)}
        >
            {showFab && (
                <FavoriteFab
                    itemId={cardData.item_id}
                    favorite={true}
                    size="small"
                />
            )}
            <Card
                variant="outlined"
                sx={{
                    ':hover': { boxShadow: 1 },
                    positon: 'relative',
                    borderColor: '#eeeeee',
                    width: '100%',
                }}
            >
                <Link to={`/items/${cardData.item_id}`}>
                    <CardMedia
                        component="img"
                        sx={{ height: 150 }}
                        image={cardData.image_url}
                    />
                    <CardContent>
                        <Typography
                            noWrap
                            sx={{
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                            }}
                        >
                            {cardData.name}
                        </Typography>
                        <Typography
                            fontSize={'0.9rem'}
                            display={'inline-flex'}
                            alignItems={'center'}
                        >
                            {cardData.store.name}
                            <Rating
                                name="read-only"
                                value={cardData.store.rating}
                                size="small"
                                readOnly
                                sx={{
                                    marginInlineStart: '5px',
                                }}
                            />
                        </Typography>
                        <Typography
                            variant="h6"
                            fontWeight={'semibold'}
                            color="green"
                        >
                            CA${cardData.price}
                        </Typography>
                    </CardContent>
                </Link>
            </Card>
        </Box>
    );
};

export default CardItem;
