from database import get_supabase
supabase = get_supabase()

auctions = supabase.table('auctions').select('*').execute().data
for auc in auctions:
    icon = auc.get('icon', '')
    title = auc.get('title', '')
    if '|IMG|' not in icon:
        if 'Apex-X Cyberpunk Keyboard' in title:
            new_icon = 'keyboard|IMG|https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80,https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&q=80,https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80'
        elif 'Chrono-Classic Vintage Watch' in title:
            new_icon = 'watch|IMG|https://images.unsplash.com/photo-1524592094714-0f0654ece975?w=800&q=80'
        elif 'one plus 13' in title.lower() or '1+ 13' in title.lower():
            new_icon = 'keyboard|IMG|https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80,https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&q=80'
        elif 'samsang 26 ultra' in title.lower():
            new_icon = 'keyboard|IMG|https://m.media-amazon.com/images/I/71xHws+eI5L._AC_UF1000,1000_QL80_.jpg,https://rukminim2.flixcart.com/image/480/640/xif0q/mobile/b/d/e/-original-imahnmndrkpry4ge.jpeg?q=90'
        else:
            new_icon = icon + '|IMG|https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80'
            
        supabase.table('auctions').update({'icon': new_icon}).eq('id', auc['id']).execute()
        print('Updated ' + auc['id'] + ' with ' + new_icon)
