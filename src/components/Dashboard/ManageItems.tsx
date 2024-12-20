import React, { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Grid2 from '@mui/material/Grid2'; // Ensure this is correctly imported
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ButtonGroup from '@mui/material/ButtonGroup';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import AddBoxIcon from '@mui/icons-material/AddBox';
import useLoginStore from '../../store/useLoginStore';
import axios from 'axios';
import * as yup from 'yup';

export default function ManageItems() {
    interface Item {
        item_id: number;
        name: string;
        description: string;
        image_url: string;
        quantity: number;
        price: number;
    }
    const [items, setItems] = useState<Item[]>([]);
    const { isLoggedIn, authToken } = useLoginStore.getState();
    const apiUrl = import.meta.env.VITE_API_URL;
    const schema = yup.object().shape({
        name: yup.string().required('Store name is required'),
        price: yup
            .number()
            .required('Price is required')
            .positive('Price must be positive'),
    });
    const [formValues, setFormValues] = useState({
        name: '',
        description: '',
        image_url: '',
        quantity: 0,
        price: 0,
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<{ [key: string]: string | null }>({});
    const [open, setOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
    const fetchItemsData = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/stores/items`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            if (response.data.success && response.data.items) {
                setItems(response.data.items);
            }
        } catch (err) {
            console.error('Error fetching store data', err);
        }
    };
    useEffect(() => {
        fetchItemsData();
    }, [apiUrl, authToken]);
    const openCreateItemDialog = () => {
        resetForm();
        setOpen(true);
    };

    const closeCreateItemDialog = () => {
        resetForm();
        setOpen(false);
    };
    const handleEdit = (item: Item) => {
        setItemToEdit(item);
        setFormValues({
            name: item.name,
            description: item.description,
            image_url: item.image_url,
            quantity: item.quantity,
            price: item.price,
        });
        setIsEditMode(true);
        setOpen(true);
    };

    const openDeleteDialog = (item: Item) => {
        setItemToDelete(item);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    const handleDelete = async () => {
        if (itemToDelete) {
            try {
                await axios.delete(
                    `${apiUrl}/api/stores/items/${itemToDelete.item_id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );
                setItems((prevItems) =>
                    prevItems.filter(
                        (item) => item.item_id !== itemToDelete.item_id
                    )
                );
                setSuccess('Item deleted successfully!');
            } catch (err) {
                console.error('Error deleting item', err);
                setError({
                    general: 'An error occurred while deleting the item.',
                });
            } finally {
                closeDeleteDialog();
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormValues((prev) => ({
            ...prev,
            [name]:
                (name === 'price' || name === 'quantity') && value === ''
                    ? 0
                    : value,
        }));

        setError((prev) => ({
            ...prev,
            [name]: null,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            await schema.validate(formValues, { abortEarly: false });
            const formData = new FormData();
            formData.append('name', formValues.name);
            formData.append('description', formValues.description);
            formData.append('quantity', formValues.quantity.toString());

            if (imageFile) {
                formData.append('file', imageFile);
            }

            const uploadResponse = imageFile
                ? await axios.post(`${apiUrl}/api/files/upload`, formData, {
                      headers: {
                          Authorization: `Bearer ${authToken}`,
                          'Content-Type': 'multipart/form-data',
                      },
                  })
                : null;

            const imageUrl = uploadResponse ? uploadResponse.data.url : null;

            if (isEditMode && itemToEdit) {
                // Update existing item
                await axios.put(
                    `${apiUrl}/api/stores/items/${itemToEdit.item_id}`,
                    {
                        name: formValues.name,
                        description: formValues.description,
                        image_url: imageUrl,
                        price: formValues.price,
                        quantity: formValues.quantity,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );

                setItems((prevItems) =>
                    prevItems.map((item) =>
                        item.item_id === itemToEdit.item_id
                            ? {
                                  ...item,
                                  ...formValues,
                                  image_url: imageUrl || item.image_url,
                              }
                            : item
                    )
                );

                setSuccess('Item updated successfully!');
            } else {
                // Create new item
                await axios.post(
                    `${apiUrl}/api/stores/items`,
                    {
                        ...formValues,
                        image_url: imageUrl,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );
                resetForm();
                setSuccess('Item created successfully! Close the window');
                fetchItemsData();
            }

            setError({});
        } catch (err) {
            let messageError = 'An error occurred while saving the item.';
            if (axios.isAxiosError(err)) {
                messageError =
                    err.response?.data?.message || 'An error occurred.';
            } else if (err instanceof yup.ValidationError) {
                const validationErrors: { [key: string]: string | null } = {};
                err.inner.forEach((error) => {
                    validationErrors[error.path as string] = error.message;
                });
                setError(validationErrors);
                return;
            }
            setError({ general: messageError });
        } finally {
            closeCreateItemDialog();
            setIsEditMode(false);
            setItemToEdit(null);
        }
    };
    const resetForm = () => {
        setFormValues({
            name: '',
            description: '',
            image_url: '',
            quantity: 0,
            price: 0,
        });
        setImageFile(null);
        setSuccess(null);
        setError({});
    };

    return (
        <Stack spacing={2}>
            <Typography
                variant='h5'
                component='h1'
                textAlign='center'
                sx={{ textTransform: 'uppercase' }}
            >
                Manage Items
            </Typography>
            {isLoggedIn ? (
                <>
                    <Box display='inline-block'>
                        <Button
                            variant='contained'
                            size='medium'
                            id='create'
                            onClick={openCreateItemDialog}
                        >
                            Create an item <AddBoxIcon sx={{ ml: 1 }} />
                        </Button>
                    </Box>
                    {items.length > 0 ? (
                        <Stack>
                            <Grid2 container spacing={2}>
                                {items.map((item) => (
                                    <Grid2 container spacing={2}>
                                        <Card sx={{ maxWidth: 400 }}>
                                            <CardMedia
                                                sx={{ height: 250 }}
                                                image={item.image_url}
                                                title={item.name}
                                            />
                                            <CardContent>
                                                <Typography
                                                    gutterBottom
                                                    variant='h5'
                                                    component='div'
                                                >
                                                    {item.name}
                                                </Typography>
                                                <Typography
                                                    variant='body2'
                                                    sx={{
                                                        color: 'text.secondary',
                                                    }}
                                                >
                                                    {item.description}
                                                </Typography>
                                            </CardContent>
                                            <CardActions>
                                                <ButtonGroup
                                                    size='small'
                                                    aria-label='Small button group'
                                                >
                                                    <Button
                                                        id='edit'
                                                        onClick={() =>
                                                            handleEdit(item)
                                                        }
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        onClick={() =>
                                                            openDeleteDialog(
                                                                item
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </Button>
                                                </ButtonGroup>
                                            </CardActions>
                                        </Card>
                                    </Grid2>
                                ))}
                            </Grid2>
                        </Stack>
                    ) : (
                        <Typography variant='body1'>No items found.</Typography>
                    )}
                    <Dialog
                        open={open}
                        onClose={closeCreateItemDialog}
                        PaperProps={{
                            component: 'form',
                            onSubmit: handleSubmit,
                        }}
                    >
                        <DialogTitle>
                            {isEditMode ? 'Edit item' : 'Create an item'}
                        </DialogTitle>
                        <DialogContent>
                            {error.general && (
                                <Typography color='error'>
                                    {error.general}
                                </Typography>
                            )}
                            {success && (
                                <Typography color='success.main'>
                                    {success}
                                </Typography>
                            )}
                            <TextField
                                autoFocus
                                margin='dense'
                                label='Item Name'
                                type='text'
                                name='name'
                                value={formValues.name}
                                onChange={handleChange}
                                error={!!error.name}
                                helperText={error.name || ''}
                                fullWidth
                                variant='outlined'
                            />
                            <TextField
                                margin='dense'
                                label='Item Description'
                                type='text'
                                name='description'
                                value={formValues.description}
                                onChange={handleChange}
                                error={!!error.description}
                                helperText={error.description || ''}
                                fullWidth
                                variant='outlined'
                                multiline
                                rows={5}
                            />
                            <Typography
                                variant='body2'
                                color='text.secondary'
                                sx={{ mt: 2 }}
                            >
                                Item Image (JPG, GIF, PNG, max 10 MB)
                            </Typography>

                            <Box display='block' mt={1}>
                                {imageFile && (
                                    <Typography>{imageFile.name}</Typography>
                                )}
                                <Button variant='contained' component='label'>
                                    Upload image
                                    <input
                                        type='file'
                                        hidden
                                        accept='.jpg,.gif,.png'
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                setImageFile(e.target.files[0]);
                                            }
                                        }}
                                    />
                                </Button>
                            </Box>

                            <Box display='block' mt={1}>
                                <TextField
                                    margin='dense'
                                    label='Quantity in stock'
                                    type='number'
                                    name='quantity'
                                    value={formValues.quantity}
                                    onChange={handleChange}
                                    error={!!error.quantity}
                                    helperText={error.quantity || ''}
                                    variant='outlined'
                                />
                            </Box>
                            <Box display='block' mt={1}>
                                <TextField
                                    margin='dense'
                                    label='Price'
                                    type='number'
                                    name='price'
                                    value={formValues.price ?? 0}
                                    onChange={handleChange}
                                    error={!!error.price}
                                    helperText={error.price || ''}
                                    variant='outlined'
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeCreateItemDialog}>
                                Close
                            </Button>
                            <Button variant='contained' type='submit'>
                                Save
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
                        <DialogTitle>Delete Item</DialogTitle>
                        <DialogContent>
                            <Typography>
                                Are you sure you want to delete this item?
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeDeleteDialog}>Cancel</Button>
                            <Button onClick={handleDelete} color='error'>
                                Delete
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            ) : (
                'Please log in'
            )}
        </Stack>
    );
}
