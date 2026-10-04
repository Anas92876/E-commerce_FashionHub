import React, { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { API_URL, getImageUrl } from '../utils/api';

// Search input with live suggestions (debounced). Enter searches all products;
// arrow keys + Enter open a suggested product.
const SearchBox = ({ initialValue = '', onDone, className = '', autoFocus = false }) => {
  const navigate = useNavigate();
  const listId = useId();
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef(null);

  useEffect(() => setQuery(initialValue), [initialValue]);

  // Fetch suggestions 250ms after typing stops
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const { data } = await axios.get(`${API_URL}/products/suggest`, { params: { q } });
        if (!cancelled) {
          setSuggestions(data.data || []);
          setActive(-1);
        }
      } catch {
        if (!cancelled) setSuggestions([]);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const finish = (path) => {
    setOpen(false);
    navigate(path);
    onDone?.();
  };

  const submit = () => {
    const q = query.trim();
    finish(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown' && suggestions.length) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp' && suggestions.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && active >= 0 && suggestions[active]) finish(`/products/${suggestions[active]._id}`);
      else submit();
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showList = open && query.trim().length >= 2;

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
        <input
          type="search"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search products..."
          aria-label="Search products"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/90 dark:bg-gray-800/90 ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
            }}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-xl ring-1 ring-gray-200 dark:ring-gray-700"
        >
          {suggestions.map((item, i) => (
            <li
              key={item._id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => finish(`/products/${item._id}`)}
              onMouseEnter={() => setActive(i)}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${i === active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            >
              {item.image ? (
                <img src={getImageUrl(item.image)} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.category}</p>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">${Number(item.price).toFixed(2)}</span>
            </li>
          ))}
          <li
            role="option"
            aria-selected={false}
            onMouseDown={(e) => e.preventDefault()}
            onClick={submit}
            className="px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border-t border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {suggestions.length ? `See all results for "${query.trim()}"` : `No quick matches - search for "${query.trim()}"`}
          </li>
        </ul>
      )}
    </div>
  );
};

export default SearchBox;
