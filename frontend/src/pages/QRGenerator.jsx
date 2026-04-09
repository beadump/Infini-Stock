import { QrCode, Zap } from 'lucide-react'
import { useState } from 'react'
import QRCode from 'react-qr-code'
import { assetApi } from '../api'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'

function QRGenerator() {
    const [formData, setFormData] = useState({
        type: '',
        assetTag: '',
        description: '',
    })
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [createdAsset, setCreatedAsset] = useState(null)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleImageChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            setError('Image size must be less than 5MB')
            return
        }

        setImageFile(file)
        const reader = new FileReader()
        reader.onload = (event) => {
            setImagePreview(event.target?.result)
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setCreatedAsset(null)

        if (!formData.type) {
            setError('Asset type is required')
            return
        }

        const qrCode = formData.assetTag.trim()

        try {
            setSubmitting(true)
            const { data } = await assetApi.createAsset({
                type: formData.type,
                qrCode: qrCode ? qrCode : undefined,
                imageData: imagePreview,
                description: formData.description.trim() || undefined,
            })
            setCreatedAsset(data)
        } catch (err) {
            const message =
                err?.response?.data?.message || err?.message || 'Failed to generate QR code'
            setError(message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="content-full bg-[#171717]">
            <div className="content-centered max-w-3xl">
                <div className="py-8">
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-2">
                        <QrCode className="text-gray-300" size={36} />
                        QR Code Generator
                    </h1>
                    <p className="text-gray-400">
                        Create unique QR codes for new assets
                    </p>
                </div>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Create New Asset QR Code</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-3">
                                    Asset Type *
                                </label>
                                <Select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    disabled={submitting}
                                >
                                    <option value="">Select type...</option>
                                    <option value="unit">
                                        System Unit
                                    </option>
                                    <option value="monitor">Monitor</option>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-3">
                                    Asset Tag (optional)
                                </label>
                                <Input
                                    type="text"
                                    name="assetTag"
                                    placeholder="AST-2026-0001 (auto-generated if empty)"
                                    value={formData.assetTag}
                                    onChange={handleChange}
                                    disabled={submitting}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-3">
                                    Asset Image (optional)
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        disabled={submitting}
                                        className="hidden"
                                        id="imageInput"
                                    />
                                    <label
                                        htmlFor="imageInput"
                                        className="inline-flex items-center justify-center w-full px-4 py-3 border border-dashed border-[#3d2e5c] rounded-md bg-[#0f0a1a] cursor-pointer hover:border-lavender-500 hover:bg-lavender-500/5 transition-colors text-gray-400 hover:text-gray-300"
                                    >
                                        {imageFile ? (
                                            <span className="text-sm">{imageFile.name}</span>
                                        ) : (
                                            <span className="text-sm">Click to upload or drag image</span>
                                        )}
                                    </label>
                                </div>
                                {imagePreview && (
                                    <div className="mt-3 rounded-md overflow-hidden border border-[#3d2e5c] h-32">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-3">
                                    Description
                                </label>
                                <Input
                                    type="text"
                                    name="description"
                                    placeholder="e.g., Dell Monitor 27-inch, HP Desktop Unit"
                                    value={formData.description}
                                    onChange={handleChange}
                                    disabled={submitting}
                                />
                            </div>

                            {error ? (
                                <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                    {error}
                                </div>
                            ) : null}

                            <Button className="w-full" disabled={submitting}>
                                <Zap className="mr-2" size={20} />
                                {submitting ? 'Generating...' : 'Generate QR Code'}
                            </Button>
                        </form>

                        <div className="mt-8 p-8 bg-[#171717] border-2 border-dashed border-[#404040] rounded-lg text-center hover:border-[#505050] transition-colors">
                            {createdAsset?.qrCode ? (
                                <div className="flex flex-col items-center gap-6">
                                    {createdAsset.imageData && (
                                        <div className="w-full">
                                            <div className="inline-block rounded-lg overflow-hidden border border-[#3d2e5c] h-48 w-48">
                                                <img
                                                    src={createdAsset.imageData}
                                                    alt="Asset"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="inline-block rounded-lg bg-white p-3">
                                        <QRCode value={createdAsset.qrCode} size={180} />
                                    </div>

                                    <div className="text-center">
                                        <p className="text-gray-300 font-semibold">
                                            {createdAsset.qrCode}
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            {createdAsset.type === 'unit'
                                                ? 'System Unit'
                                                : 'Monitor'}
                                            {createdAsset.description
                                                ? ` • ${createdAsset.description}`
                                                : ''}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <QrCode className="text-gray-600 mx-auto mb-4" size={48} />
                                    <p className="text-gray-400 mb-2">
                                        Generated QR code will appear here
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                        You can download and print it
                                    </p>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default QRGenerator
